import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// List dogs who liked my dog but I have not responded to yet.
// Powers the "💕 X 個人喜歡你" banner + likes-you list view.
router.get("/likes-you", async (req: Request, res: Response) => {
  const { dogId } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  const { data: incomingLikes, error: likesError } = await supabaseAdmin
    .from("swipes")
    .select("swiper_dog_id, created_at")
    .eq("swiped_dog_id", dogId as string)
    .eq("direction", "like");

  if (likesError) {
    res.status(400).json({ error: likesError.message });
    return;
  }

  const incomingIds = (incomingLikes ?? []).map((s) => s.swiper_dog_id);
  if (incomingIds.length === 0) {
    res.json([]);
    return;
  }

  const { data: myResponses } = await supabaseAdmin
    .from("swipes")
    .select("swiped_dog_id")
    .eq("swiper_dog_id", dogId as string)
    .in("swiped_dog_id", incomingIds);

  const respondedTo = new Set((myResponses ?? []).map((s) => s.swiped_dog_id));
  const pendingIds = incomingIds.filter((id) => !respondedTo.has(id));

  if (pendingIds.length === 0) {
    res.json([]);
    return;
  }

  const { data: dogs, error: dogsError } = await supabaseAdmin
    .from("dogs")
    .select("*, owner:profiles!dogs_owner_id_fkey(display_name, avatar_url)")
    .in("id", pendingIds)
    .eq("is_active", true);

  if (dogsError) {
    res.status(400).json({ error: dogsError.message });
    return;
  }

  const likeMap = new Map((incomingLikes ?? []).map((s) => [s.swiper_dog_id, s.created_at]));
  const enriched = (dogs ?? []).map((d) => ({
    ...d,
    liked_at: likeMap.get(d.id),
  }));
  enriched.sort((a, b) => (b.liked_at ?? "").localeCompare(a.liked_at ?? ""));

  res.json(enriched);
});

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
