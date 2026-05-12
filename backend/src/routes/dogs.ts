import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/mine", async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("dogs")
    .select("*")
    .eq("owner_id", req.userId!)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.get("/candidates/list", async (req: Request, res: Response) => {
  const { dogId } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  const { data: swipedDogs } = await supabaseAdmin
    .from("swipes")
    .select("swiped_dog_id")
    .eq("swiper_dog_id", dogId as string);

  const { data: matchesA } = await supabaseAdmin
    .from("matches")
    .select("dog_b_id")
    .eq("dog_a_id", dogId as string);

  const { data: matchesB } = await supabaseAdmin
    .from("matches")
    .select("dog_a_id")
    .eq("dog_b_id", dogId as string);

  const excludeIds = [
    dogId as string,
    ...(swipedDogs?.map((s) => s.swiped_dog_id) ?? []),
    ...(matchesA?.map((m) => m.dog_b_id) ?? []),
    ...(matchesB?.map((m) => m.dog_a_id) ?? []),
  ];

  const { data, error } = await supabaseAdmin
    .from("dogs")
    .select("*, owner:profiles(*)")
    .eq("is_active", true)
    .not("id", "in", `(${excludeIds.join(",")})`)
    .limit(20);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("dogs")
    .select("*, owner:profiles(*)")
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(404).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.post("/", async (req: Request, res: Response) => {
  const dogData = { ...req.body, owner_id: req.userId };

  const { data, error } = await supabaseAdmin
    .from("dogs")
    .insert(dogData)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.put("/:id", async (req: Request, res: Response) => {
  console.log(`[dogs PUT] id=${req.params.id} userId=${req.userId}`);
  console.log(`[dogs PUT] body keys=${Object.keys(req.body).join(",")}`);

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("dogs")
    .select("id, owner_id, is_active")
    .eq("id", req.params.id)
    .maybeSingle();

  console.log(`[dogs PUT] lookup existing=${JSON.stringify(existing)} error=${lookupError?.message}`);

  if (lookupError) {
    res.status(400).json({ error: lookupError.message });
    return;
  }
  if (!existing) {
    res.status(404).json({ error: "Dog not found" });
    return;
  }
  if (existing.owner_id !== req.userId) {
    res.status(403).json({ error: "Not your dog" });
    return;
  }

  // Strip fields that shouldn't be writable through this endpoint —
  // anything client-supplied for owner_id / id / created_at would
  // either be ignored or wreck the row. Also drop the joined `owner`
  // object if it leaked back from a previous fetchMyDog.
  const { id: _id, owner_id: _o, created_at: _c, owner: _ow, ...updates } = req.body;
  console.log(`[dogs PUT] sanitized update keys=${Object.keys(updates).join(",")}`);

  const { data, error } = await supabaseAdmin
    .from("dogs")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  console.log(`[dogs PUT] update result data=${data ? "row" : "null"} error=${error?.message}`);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (!data) {
    res.status(500).json({ error: "Update returned no row" });
    return;
  }

  res.json(data);
});

export default router;
