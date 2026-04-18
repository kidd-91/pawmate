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
    .single();

  if (error && error.code !== "PGRST116") {
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
  const { data: existing } = await supabaseAdmin
    .from("dogs")
    .select("owner_id")
    .eq("id", req.params.id)
    .single();

  if (existing?.owner_id !== req.userId) {
    res.status(403).json({ error: "Not your dog" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("dogs")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();

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

  const excludeIds = [
    dogId as string,
    ...(swipedDogs?.map((s) => s.swiped_dog_id) ?? []),
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

export default router;
