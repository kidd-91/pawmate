import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.put("/", async (req: Request, res: Response) => {
  const { display_name } = req.body;

  // UPSERT instead of UPDATE — old accounts that pre-date the
  // handle_new_user trigger (migration 014) may not have a profiles row
  // yet. UPDATE on a missing row + .single() throws "Cannot coerce the
  // result to a single JSON object", which is what users were seeing on
  // 「儲存失敗」.
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: req.userId!, display_name }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
