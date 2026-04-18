import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

router.post(
  "/dog-photo",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const fileName = `${req.userId}/${Date.now()}.${req.file.originalname.split(".").pop()}`;

    const { error } = await supabaseAdmin.storage
      .from("dog-photos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("dog-photos").getPublicUrl(fileName);

    res.json({ url: publicUrl });
  }
);

export default router;
