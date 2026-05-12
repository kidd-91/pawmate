import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (signUpError) {
    res.status(400).json({ error: signUpError.message });
    return;
  }

  // profiles row is now created automatically by the on_auth_user_created
  // trigger (migration 014) — no manual insert needed here. The trigger
  // pulls display_name from raw_user_meta_data which we set above.

  res.json({ user: data.user, needsVerification: !data.session });
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
  // maybeSingle — old accounts without a profiles row should get null,
  // not a "Cannot coerce" 400. The client treats null as "needs setup"
  // and the upsert in PUT /api/profiles will lazy-create on first save.
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.userId!)
    .maybeSingle();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(profile);
});

// Delete the authenticated user's entire account.
// auth.users → profiles → dogs → (swipes/matches/messages/expenses/health)
// all cascade via FK ON DELETE CASCADE, so a single admin.deleteUser call
// is enough. (Storage objects in Supabase Storage are not cascaded — left
// for a future cleanup job; they're orphaned but inaccessible without an
// owner row.)
//
// Required by Google Play 2024 policy: apps that allow account creation
// must offer in-app account deletion.
router.delete("/me", authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.userId!);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Account deleted" });
});

export default router;
