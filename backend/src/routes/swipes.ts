import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/check", async (req: Request, res: Response) => {
  const { swiperId, swipedId } = req.query;
  if (!swiperId || !swipedId) {
    res.status(400).json({ error: "swiperId and swipedId required" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("swipes")
    .select("id")
    .eq("swiper_dog_id", swiperId as string)
    .eq("swiped_dog_id", swipedId as string)
    .eq("direction", "like");

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data ?? []);
});

router.post("/", async (req: Request, res: Response) => {
  const { swiper_dog_id, swiped_dog_id, direction } = req.body;

  const { data: existingSwipe } = await supabaseAdmin
    .from("swipes")
    .select("id")
    .eq("swiper_dog_id", swiper_dog_id)
    .eq("swiped_dog_id", swiped_dog_id)
    .maybeSingle();

  if (existingSwipe) {
    await supabaseAdmin
      .from("swipes")
      .update({ direction })
      .eq("id", existingSwipe.id);
  } else {
    const { error: swipeError } = await supabaseAdmin
      .from("swipes")
      .insert({ swiper_dog_id, swiped_dog_id, direction });

    if (swipeError) {
      res.status(400).json({ error: swipeError.message });
      return;
    }
  }

  if (direction !== "like") {
    res.json({ matched: false });
    return;
  }

  const { data: mutualSwipe } = await supabaseAdmin
    .from("swipes")
    .select("id")
    .eq("swiper_dog_id", swiped_dog_id)
    .eq("swiped_dog_id", swiper_dog_id)
    .eq("direction", "like")
    .single();

  if (!mutualSwipe) {
    res.json({ matched: false });
    return;
  }

  const { data: existingMatch } = await supabaseAdmin
    .from("matches")
    .select("*")
    .or(
      `and(dog_a_id.eq.${swiper_dog_id},dog_b_id.eq.${swiped_dog_id}),and(dog_a_id.eq.${swiped_dog_id},dog_b_id.eq.${swiper_dog_id})`
    )
    .limit(1)
    .single();

  if (existingMatch) {
    res.json({ matched: true, match: existingMatch });
    return;
  }

  const { data: newMatch, error: matchError } = await supabaseAdmin
    .from("matches")
    .insert({ dog_a_id: swiper_dog_id, dog_b_id: swiped_dog_id })
    .select(
      "*, dog_a:dogs!matches_dog_a_id_fkey(*), dog_b:dogs!matches_dog_b_id_fkey(*)"
    )
    .single();

  if (matchError) {
    res.status(400).json({ error: matchError.message });
    return;
  }

  res.json({ matched: true, match: newMatch });
});

router.delete("/between", async (req: Request, res: Response) => {
  const { dogAId, dogBId } = req.body;

  const { error } = await supabaseAdmin
    .from("swipes")
    .delete()
    .or(
      `and(swiper_dog_id.eq.${dogAId},swiped_dog_id.eq.${dogBId}),and(swiper_dog_id.eq.${dogBId},swiped_dog_id.eq.${dogAId})`
    );

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: "Swipes deleted" });
});

export default router;
