import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { display_name: displayName },
    });

  if (authError) {
    res.status(400).json({ error: authError.message });
    return;
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({ id: authData.user.id, display_name: displayName });

  if (profileError) {
    res.status(400).json({ error: profileError.message });
    return;
  }

  res.json({ user: authData.user });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({
    session: data.session,
    user: data.user,
  });
});

router.post("/logout", authMiddleware, async (_req: Request, res: Response) => {
  res.json({ message: "Logged out" });
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.userId!)
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(profile);
});

export default router;
