import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.post("/update-location", async (req: Request, res: Response) => {
  const { lat, lng } = req.body;

  const { error } = await supabaseAdmin.rpc("update_user_location_by_id", {
    user_id: req.userId!,
    lat,
    lng,
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: "Location updated" });
});

router.get("/nearby-dogs", async (req: Request, res: Response) => {
  const { lat, lng, radius_km } = req.query;

  const { data, error } = await supabaseAdmin.rpc("get_nearby_dogs", {
    user_lat: Number(lat),
    user_lng: Number(lng),
    radius_km: Number(radius_km ?? 5),
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Get user's dog to check swipes & matches
  const { data: myDog } = await supabaseAdmin
    .from("dogs")
    .select("id")
    .eq("owner_id", req.userId!)
    .eq("is_active", true)
    .maybeSingle();

  let excludeIds = new Set<string>();

  if (myDog) {
    const { data: swipedDogs } = await supabaseAdmin
      .from("swipes")
      .select("swiped_dog_id")
      .eq("swiper_dog_id", myDog.id);

    const { data: matchesA } = await supabaseAdmin
      .from("matches")
      .select("dog_b_id")
      .eq("dog_a_id", myDog.id);

    const { data: matchesB } = await supabaseAdmin
      .from("matches")
      .select("dog_a_id")
      .eq("dog_b_id", myDog.id);

    (swipedDogs ?? []).forEach((s) => excludeIds.add(s.swiped_dog_id));
    (matchesA ?? []).forEach((m) => excludeIds.add(m.dog_b_id));
    (matchesB ?? []).forEach((m) => excludeIds.add(m.dog_a_id));
  }

  const filtered = (data ?? []).filter(
    (d: { owner_id: string; id: string }) =>
      d.owner_id !== req.userId && !excludeIds.has(d.id)
  );

  res.json(filtered);
});

export default router;
