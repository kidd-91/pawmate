import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// ============================================================================
// Types: lookup (vaccine / weight / medication / vet_visit / deworming / grooming)
// ============================================================================
router.get("/types", async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("health_record_types")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data ?? []);
});

// ============================================================================
// Records: list for a dog (optional type filter)
// ============================================================================
router.get("/", async (req: Request, res: Response) => {
  const { dogId, type } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  let query = supabaseAdmin
    .from("health_records")
    .select("*, type:health_record_types!health_records_type_code_fkey(*)")
    .eq("dog_id", dogId as string)
    .order("recorded_at", { ascending: false });

  if (type) query = query.eq("type_code", type as string);

  const { data, error } = await query;
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data ?? []);
});

// ============================================================================
// Records: create
// ============================================================================
router.post("/", async (req: Request, res: Response) => {
  const {
    dog_id,
    type_code,
    recorded_at,
    title,
    numeric_value,
    notes,
    document_url,
    metadata,
    next_due_at,
  } = req.body;

  if (!dog_id || !type_code) {
    res.status(400).json({ error: "dog_id and type_code are required" });
    return;
  }

  const { data: dog } = await supabaseAdmin
    .from("dogs")
    .select("owner_id")
    .eq("id", dog_id)
    .single();

  if (!dog || dog.owner_id !== req.userId) {
    res.status(403).json({ error: "Not your dog" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("health_records")
    .insert({
      dog_id,
      type_code,
      recorded_at: recorded_at ?? new Date().toISOString().slice(0, 10),
      title: title ?? "",
      numeric_value: numeric_value ?? null,
      notes: notes ?? "",
      document_url: document_url ?? null,
      metadata: metadata ?? {},
      next_due_at: next_due_at ?? null,
      recorded_by_user_id: req.userId,
    })
    .select("*, type:health_record_types!health_records_type_code_fkey(*)")
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data);
});

// ============================================================================
// Records: delete (only the dog's owner)
// ============================================================================
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: existing } = await supabaseAdmin
    .from("health_records")
    .select("dog_id, dogs(owner_id)")
    .eq("id", id)
    .single();

  if (!existing) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  // @ts-ignore — supabase returns nested join
  const ownerId = existing.dogs?.owner_id;
  if (ownerId !== req.userId) {
    res.status(403).json({ error: "Not your dog" });
    return;
  }

  const { error } = await supabaseAdmin.from("health_records").delete().eq("id", id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Deleted" });
});

// ============================================================================
// Reminders: upcoming health events for the user's dogs
// ============================================================================
router.get("/reminders", async (req: Request, res: Response) => {
  const { withinDays } = req.query;
  const within = withinDays ? parseInt(withinDays as string, 10) : 30;

  const { data, error } = await supabaseAdmin.rpc("get_upcoming_health_reminders", {
    p_user_id: req.userId,
    p_within_days: within,
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data ?? []);
});

// ============================================================================
// Latest weight: shortcut for dog summary cards
// ============================================================================
router.get("/latest-weight", async (req: Request, res: Response) => {
  const { dogId } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("health_records")
    .select("numeric_value, recorded_at")
    .eq("dog_id", dogId as string)
    .eq("type_code", "weight")
    .not("numeric_value", "is", null)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data);
});

export default router;
