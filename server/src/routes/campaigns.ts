import { Router } from "express";
import {
  Campaign,
  Contribution,
  Notification,
  Report,
  User,
} from "../models/index.js";
import { allow, auth, AuthRequest } from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";
const router = Router();
router.get("/", async (req, res) => {
  const filter: any = { status: "approved", deadline: { $gt: new Date() } };
  if (req.query.category && req.query.category !== "All")
    filter.category = req.query.category;
  if (req.query.search)
    filter.title = {
      $regex: String(req.query.search).slice(0, 80),
      $options: "i",
    };
  if (req.query.maxGoal)
    filter.goal = { $lte: Math.max(0, Number(req.query.maxGoal)) };
  if (req.query.deadline)
    filter.deadline = {
      $lte: new Date(String(req.query.deadline)),
      $gt: new Date(),
    };
  const page = Math.max(1, Number(req.query.page) || 1),
    limit = Math.min(12, Math.max(1, Number(req.query.limit) || 9));
  const sort: any =
    req.query.sort === "newest"
      ? { createdAt: -1 }
      : req.query.sort === "deadline"
        ? { deadline: 1 }
        : { raised: -1 };
  const [items, total] = await Promise.all([
    Campaign.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Campaign.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});
router.get("/mine", auth, allow("creator"), async (req: AuthRequest, res) =>
  res.json(
    await Campaign.find({ creatorEmail: req.user!.email }).sort({
      deadline: -1,
    }),
  ),
);
router.get("/:id", async (req, res) => {
  const item = await Campaign.findById(req.params.id);
  item
    ? res.json(item)
    : res.status(404).json({ message: "Campaign not found" });
});
router.post("/", auth, allow("creator"), async (req: AuthRequest, res) =>
  res
    .status(201)
    .json(
      await Campaign.create({
        ...req.body,
        creatorName: req.user!.name,
        creatorEmail: req.user!.email,
        status: "pending",
      }),
    ),
);
router.patch("/:id", auth, async (req: AuthRequest, res) => {
  const item = await Campaign.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Campaign not found" });
  if (req.user!.role !== "admin" && item.creatorEmail !== req.user!.email)
    return res.status(403).json({ message: "Not allowed" });
  const safe =
    req.user!.role === "admin"
      ? req.body
      : (({ title, story, reward }) => ({ title, story, reward }))(req.body);
  Object.assign(item, safe);
  await item.save();
  res.json(item);
});
router.delete("/:id", auth, async (req: AuthRequest, res) => {
  const item = await Campaign.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Campaign not found" });
  if (req.user!.role !== "admin" && item.creatorEmail !== req.user!.email)
    return res.status(403).json({ message: "Not allowed" });
  const approved = await Contribution.find({
    campaignId: item._id,
    status: "approved",
  });
  await Promise.all(
    approved.map((c) =>
      User.updateOne(
        { email: c.supporterEmail },
        { $inc: { credits: c.amount } },
      ),
    ),
  );
  await Contribution.deleteMany({ campaignId: item._id });
  await item.deleteOne();
  res.json({ message: "Campaign deleted and approved contributions refunded" });
});
router.post(
  "/:id/report",
  auth,
  allow("supporter"),
  async (req: AuthRequest, res) => {
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Campaign not found" });
    res
      .status(201)
      .json(
        await Report.create({
          campaignId: c._id,
          campaignTitle: c.title,
          reporterName: req.user!.name,
          reporterEmail: req.user!.email,
          reason: req.body.reason,
        }),
      );
  },
);
router.patch(
  "/:id/review",
  auth,
  allow("admin"),
  async (req: AuthRequest, res) => {
    const c = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (c) {
      await Notification.create({
        toEmail: c.creatorEmail,
        message: `Your campaign "${c.title}" was ${req.body.status}.`,
        actionRoute: "/dashboard",
      });
      await sendEmail(
        c.creatorEmail ?? "",
        `Fundora campaign ${req.body.status}`,
        `<p>Your campaign <b>${c.title}</b> was ${req.body.status}.</p>`,
      );
    }
    res.json(c);
  },
);
export default router;
