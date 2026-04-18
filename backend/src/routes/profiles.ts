import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.put("/", async (req: Request, res: Response) => {
  const { display_name } = req.body;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ display_name })
    .eq("id", req.userId!)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
