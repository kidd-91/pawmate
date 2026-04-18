import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  const { dogId } = req.query;
  if (!dogId) {
    res.status(400).json({ error: "dogId required" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("matches")
    .select(
      "*, dog_a:dogs!matches_dog_a_id_fkey(*, owner:profiles(*)), dog_b:dogs!matches_dog_b_id_fkey(*, owner:profiles(*))"
    )
    .or(`dog_a_id.eq.${dogId},dog_b_id.eq.${dogId}`)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { dogAId, dogBId } = req.body;

  const { error: matchError } = await supabaseAdmin
    .from("matches")
    .delete()
    .or(
      `and(dog_a_id.eq.${dogAId},dog_b_id.eq.${dogBId}),and(dog_a_id.eq.${dogAId},dog_b_id.eq.${dogBId})`
    );

  if (matchError) {
    res.status(400).json({ error: matchError.message });
    return;
  }

  res.json({ message: "Match deleted" });
});

export default router;
