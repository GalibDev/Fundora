import { Router } from "express";
import {
  Campaign,
  Payment,
  Report,
  User,
  Withdrawal,
} from "../models/index.js";
import { allow, auth } from "../middleware/auth.js";

const router = Router();
router.use(auth, allow("admin"));

router.get("/stats", async (_req, res) => {
  const [
    supporters,
    creators,
    credit,
    paid,
    campaigns,
    pendingCampaigns,
    pendingWithdrawals,
    reports,
  ] = await Promise.all([
    User.countDocuments({ role: "supporter" }),
    User.countDocuments({ role: "creator" }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$credits" } } }]),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: "pending" }),
    Withdrawal.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: "open" }),
  ]);
  res.json({
    supporters,
    creators,
    availableCredits: credit[0]?.total || 0,
    payments: paid[0]?.total || 0,
    campaigns,
    pendingCampaigns,
    pendingWithdrawals,
    reports,
  });
});
router.get("/users", async (_req, res) =>
  res.json(await User.find().select("-password").sort({ createdAt: -1 })),
);
router.patch("/users/:id/role", async (req, res) => {
  if (!["admin", "creator", "supporter"].includes(req.body.role))
    return res.status(400).json({ message: "Invalid role" });
  res.json(
    await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true },
    ),
  );
});
router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
});
router.get("/campaigns", async (req, res) =>
  res.json(
    await Campaign.find(
      req.query.status ? { status: req.query.status } : {},
    ).sort({ createdAt: -1 }),
  ),
);
router.get("/withdrawals", async (_req, res) =>
  res.json(await Withdrawal.find().sort({ createdAt: -1 })),
);
router.get("/reports", async (_req, res) =>
  res.json(await Report.find().sort({ createdAt: -1 })),
);
router.patch("/reports/:id", async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (req.body.action === "suspend")
    await Campaign.findByIdAndUpdate(report?.campaignId, {
      status: "suspended",
    });
  res.json(report);
});
export default router;
