import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// ============================================================================
// Categories: list system + user's custom categories
// ============================================================================
router.get("/categories", async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("expense_categories")
    .select("*")
    .or(`is_system.eq.true,created_by_user_id.eq.${req.userId}`)
    .order("sort_order", { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data ?? []);
});

router.post("/categories", async (req: Request, res: Response) => {
  const { name, icon, color } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("expense_categories")
    .insert({
      name,
      icon: icon ?? null,
      color: color ?? null,
      is_system: false,
      created_by_user_id: req.userId,
    })
    .select("*")
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data);
});

// ============================================================================
// Expenses: list for a dog (optional date range)
// ============================================================================
router.get("/", async (req: Request, res: Response) => {
  const { dogId, from, to } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  const { data: pets, error: petsError } = await supabaseAdmin
    .from("expense_pets")
    .select("expense_id, share_ratio")
    .eq("dog_id", dogId as string);

  if (petsError) {
    res.status(400).json({ error: petsError.message });
    return;
  }

  const expenseIds = (pets ?? []).map((p) => p.expense_id);
  if (expenseIds.length === 0) {
    res.json([]);
    return;
  }

  let query = supabaseAdmin
    .from("dog_expenses")
    .select("*, category:expense_categories!dog_expenses_category_id_fkey(*)")
    .in("id", expenseIds)
    .order("spent_at", { ascending: false });

  if (from) query = query.gte("spent_at", from as string);
  if (to) query = query.lte("spent_at", to as string);

  const { data, error } = await query;
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Attach the dog's share_ratio so the client knows the per-dog amount
  const ratioMap = new Map((pets ?? []).map((p) => [p.expense_id, p.share_ratio]));
  const enriched = (data ?? []).map((e) => ({
    ...e,
    share_ratio: ratioMap.get(e.id) ?? 1,
  }));
  res.json(enriched);
});

// ============================================================================
// Expense: create (handles single-dog and multi-dog/share scenarios)
// ============================================================================
router.post("/", async (req: Request, res: Response) => {
  const {
    category_id,
    amount,
    currency,
    spent_at,
    merchant,
    notes,
    receipt_photo_url,
    receipt_data,
    dog_ids,           // string[] — which dogs share this expense
    share_ratios,      // number[] — optional, parallel to dog_ids; defaults to even split
  } = req.body;

  if (!category_id || amount == null || !Array.isArray(dog_ids) || dog_ids.length === 0) {
    res.status(400).json({ error: "category_id, amount, and at least one dog_id are required" });
    return;
  }

  const { data: expense, error: expenseError } = await supabaseAdmin
    .from("dog_expenses")
    .insert({
      category_id,
      amount,
      currency: currency ?? "TWD",
      spent_at: spent_at ?? new Date().toISOString().slice(0, 10),
      paid_by_user_id: req.userId,
      merchant: merchant ?? null,
      notes: notes ?? "",
      receipt_photo_url: receipt_photo_url ?? null,
      receipt_data: receipt_data ?? {},
    })
    .select("*")
    .single();

  if (expenseError) {
    res.status(400).json({ error: expenseError.message });
    return;
  }

  // Attach dogs via expense_pets. Default share is even split.
  const evenShare = 1 / dog_ids.length;
  const petRows = dog_ids.map((dogId: string, i: number) => ({
    expense_id: expense.id,
    dog_id: dogId,
    share_ratio: share_ratios?.[i] ?? evenShare,
  }));

  const { error: petsError } = await supabaseAdmin
    .from("expense_pets")
    .insert(petRows);

  if (petsError) {
    // Roll back the expense if pet attachment fails
    await supabaseAdmin.from("dog_expenses").delete().eq("id", expense.id);
    res.status(400).json({ error: petsError.message });
    return;
  }

  res.json({ ...expense, share_ratio: evenShare });
});

// ============================================================================
// Expense: delete (only the payer can delete)
// ============================================================================
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: existing } = await supabaseAdmin
    .from("dog_expenses")
    .select("paid_by_user_id")
    .eq("id", id)
    .single();

  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  if (existing.paid_by_user_id !== req.userId) {
    res.status(403).json({ error: "Only the payer can delete" });
    return;
  }

  const { error } = await supabaseAdmin.from("dog_expenses").delete().eq("id", id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Deleted" });
});

// ============================================================================
// Summary: monthly totals + by-category breakdown for a dog
// ============================================================================
router.get("/summary", async (req: Request, res: Response) => {
  const { dogId, year, month } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  const now = new Date();
  const y = year ? parseInt(year as string, 10) : now.getFullYear();
  const m = month ? parseInt(month as string, 10) : now.getMonth() + 1;
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: pets } = await supabaseAdmin
    .from("expense_pets")
    .select("expense_id, share_ratio")
    .eq("dog_id", dogId as string);

  const expenseIds = (pets ?? []).map((p) => p.expense_id);
  if (expenseIds.length === 0) {
    res.json({ year: y, month: m, total: 0, by_category: [] });
    return;
  }

  const { data: expenses, error } = await supabaseAdmin
    .from("dog_expenses")
    .select("id, amount, category_id, category:expense_categories!dog_expenses_category_id_fkey(id, name, icon, color)")
    .in("id", expenseIds)
    .gte("spent_at", from)
    .lte("spent_at", to);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const ratioMap = new Map((pets ?? []).map((p) => [p.expense_id, p.share_ratio]));
  type Row = {
    id: string;
    amount: number;
    category_id: string;
    category: { id: string; name: string; icon: string | null; color: string | null } | null;
  };
  const byCategory = new Map<string, { id: string; name: string; icon: string | null; color: string | null; total: number }>();
  let total = 0;

  for (const e of (expenses ?? []) as unknown as Row[]) {
    const ratio = ratioMap.get(e.id) ?? 1;
    const dogShare = Number(e.amount) * Number(ratio);
    total += dogShare;

    const cat = e.category;
    if (!cat) continue;
    const cur = byCategory.get(cat.id) ?? {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      total: 0,
    };
    cur.total += dogShare;
    byCategory.set(cat.id, cur);
  }

  const byCategoryArr = Array.from(byCategory.values()).sort((a, b) => b.total - a.total);
  res.json({ year: y, month: m, total, by_category: byCategoryArr });
});

export default router;
