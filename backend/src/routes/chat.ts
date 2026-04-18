import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/:matchId/messages", async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*, sender:profiles(*)")
    .eq("match_id", req.params.matchId)
    .order("created_at", { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.get("/:matchId/messages/last", async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("match_id", req.params.matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.post("/:matchId/messages", async (req: Request, res: Response) => {
  const { content } = req.body;

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      match_id: req.params.matchId,
      sender_id: req.userId!,
      content,
    })
    .select("*, sender:profiles(*)")
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
