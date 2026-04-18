import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../services/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

async function getFriendUserIds(userId: string): Promise<string[]> {
  const { data: myDog } = await supabaseAdmin
    .from("dogs")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!myDog) return [];

  const { data: matchesA } = await supabaseAdmin
    .from("matches")
    .select("dog_b_id")
    .eq("dog_a_id", myDog.id);

  const { data: matchesB } = await supabaseAdmin
    .from("matches")
    .select("dog_a_id")
    .eq("dog_b_id", myDog.id);

  const matchedDogIds = [
    ...(matchesA ?? []).map((m) => m.dog_b_id),
    ...(matchesB ?? []).map((m) => m.dog_a_id),
  ];

  if (matchedDogIds.length === 0) return [];

  const { data: friendDogs } = await supabaseAdmin
    .from("dogs")
    .select("owner_id")
    .in("id", matchedDogIds);

  const friendIds = new Set<string>();
  (friendDogs ?? []).forEach((d) => {
    if (d.owner_id && d.owner_id !== userId) friendIds.add(d.owner_id);
  });

  return Array.from(friendIds);
}

router.get("/", async (req: Request, res: Response) => {
  const currentDate = new Date().toISOString().split("T")[0];

  const friendIds = await getFriendUserIds(req.userId!);
  const visibleCreators = [req.userId!, ...friendIds];

  const { data, error } = await supabaseAdmin
    .from("walk_groups")
    .select(
      "*, creator_dog:dogs!walk_groups_creator_dog_id_fkey(*, owner:profiles(*))"
    )
    .eq("is_active", true)
    .gte("walk_date", currentDate)
    .in("creator_id", visibleCreators)
    .order("walk_date", { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const groupIds = data?.map((g) => g.id) ?? [];
  let memberCounts: Record<string, number> = {};

  if (groupIds.length > 0) {
    const { data: members } = await supabaseAdmin
      .from("walk_group_members")
      .select("group_id")
      .in("group_id", groupIds)
      .eq("status", "approved");

    if (members) {
      for (const m of members) {
        memberCounts[m.group_id] = (memberCounts[m.group_id] ?? 0) + 1;
      }
    }
  }

  const result = data?.map((g) => ({
    ...g,
    member_count: (memberCounts[g.id] ?? 0) + 1,
  }));

  res.json(result);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data: group, error } = await supabaseAdmin
    .from("walk_groups")
    .select(
      "*, creator_dog:dogs!walk_groups_creator_dog_id_fkey(*, owner:profiles(*))"
    )
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const { data: members } = await supabaseAdmin
    .from("walk_group_members")
    .select("*, dog:dogs(*, owner:profiles(*)), profile:profiles(*)")
    .eq("group_id", req.params.id)
    .order("joined_at", { ascending: true });

  res.json({ ...group, members: members ?? [] });
});

router.post("/", async (req: Request, res: Response) => {
  const groupData = { ...req.body, creator_id: req.userId };

  const { data, error } = await supabaseAdmin
    .from("walk_groups")
    .insert(groupData)
    .select("*")
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { data: group } = await supabaseAdmin
    .from("walk_groups")
    .select("creator_id")
    .eq("id", req.params.id)
    .single();

  if (group?.creator_id !== req.userId) {
    res.status(403).json({ error: "只有發起人可以編輯" });
    return;
  }

  const { title, location, walk_date, walk_time, notes, max_members } = req.body;

  const { data, error } = await supabaseAdmin
    .from("walk_groups")
    .update({ title, location, walk_date, walk_time, notes, max_members })
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.post("/:id/join", async (req: Request, res: Response) => {
  const { dog_id } = req.body;

  const { data: existing } = await supabaseAdmin
    .from("walk_group_members")
    .select("id, status")
    .eq("group_id", req.params.id)
    .eq("user_id", req.userId!)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending") {
      res.json({ message: "Already pending", status: "pending" });
      return;
    }
    if (existing.status === "approved") {
      res.json({ message: "Already joined", status: "approved" });
      return;
    }
    // rejected -> allow re-request
    await supabaseAdmin
      .from("walk_group_members")
      .update({ status: "pending", dog_id })
      .eq("id", existing.id);

    res.json({ message: "Re-requested", status: "pending" });
    return;
  }

  const { error } = await supabaseAdmin.from("walk_group_members").insert({
    group_id: req.params.id,
    user_id: req.userId!,
    dog_id,
    status: "pending",
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: "Request sent", status: "pending" });
});

router.post("/:id/approve", async (req: Request, res: Response) => {
  const { memberId } = req.body;

  const { data: group } = await supabaseAdmin
    .from("walk_groups")
    .select("creator_id")
    .eq("id", req.params.id)
    .single();

  if (group?.creator_id !== req.userId) {
    res.status(403).json({ error: "只有發起人可以審核" });
    return;
  }

  const { error } = await supabaseAdmin
    .from("walk_group_members")
    .update({ status: "approved" })
    .eq("id", memberId)
    .eq("group_id", req.params.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: "Approved" });
});

router.post("/:id/reject", async (req: Request, res: Response) => {
  const { memberId } = req.body;

  const { data: group } = await supabaseAdmin
    .from("walk_groups")
    .select("creator_id")
    .eq("id", req.params.id)
    .single();

  if (group?.creator_id !== req.userId) {
    res.status(403).json({ error: "只有發起人可以審核" });
    return;
  }

  const { error } = await supabaseAdmin
    .from("walk_group_members")
    .delete()
    .eq("id", memberId)
    .eq("group_id", req.params.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: "Rejected" });
});

router.delete("/:id/leave", async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin
    .from("walk_group_members")
    .delete()
    .eq("group_id", req.params.id)
    .eq("user_id", req.userId!);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: "Left" });
});

router.get("/:id/messages", async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("walk_group_messages")
    .select("*, sender:profiles(*)")
    .eq("group_id", req.params.id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.post("/:id/messages", async (req: Request, res: Response) => {
  const { content } = req.body;

  const { data, error } = await supabaseAdmin
    .from("walk_group_messages")
    .insert({
      group_id: req.params.id,
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
