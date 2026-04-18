import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profiles";
import dogRoutes from "./routes/dogs";
import swipeRoutes from "./routes/swipes";
import matchRoutes from "./routes/matches";
import chatRoutes from "./routes/chat";
import walkRoutes from "./routes/walks";
import mapRoutes from "./routes/map";
import uploadRoutes from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/dogs", dogRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/walks", walkRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`PawMate API running on port ${PORT}`);
});
