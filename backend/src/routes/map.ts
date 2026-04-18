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

  res.json(data);
});

export default router;
