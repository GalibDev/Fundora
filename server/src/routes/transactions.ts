import { Router } from "express";
import Stripe from "stripe";
import {
  Campaign,
  Contribution,
  Notification,
  Payment,
  User,
  Withdrawal,
} from "../models/index.js";
import { allow, auth, AuthRequest } from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";
const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
router.get("/dashboard/stats", auth, async (req: AuthRequest, res) => {
  if (req.user!.role === "supporter") {
    const rows = await Contribution.find({ supporterEmail: req.user!.email });
    return res.json({
      total: rows.length,
      pending: rows.filter((x) => x.status === "pending").length,
      approvedCredits: rows
        .filter((x) => x.status === "approved")
        .reduce((n, x) => n + (x.amount || 0), 0),
    });
  }
  if (req.user!.role === "creator") {
    const [campaigns, pending] = await Promise.all([
      Campaign.find({ creatorEmail: req.user!.email }),
      Contribution.countDocuments({
        creatorEmail: req.user!.email,
        status: "pending",
      }),
    ]);
    return res.json({
      total: campaigns.length,
      active: campaigns.filter(
        (x) => x.status === "approved" && x.deadline && x.deadline > new Date(),
      ).length,
      raised: campaigns.reduce((n, x) => n + (x.raised || 0), 0),
      pending,
    });
  }
  res.json({});
});
router.post(
  "/contributions",
  auth,
  allow("supporter"),
  async (req: AuthRequest, res) => {
    const session = await (await import("mongoose")).default.startSession();
    try {
      session.startTransaction();
      const key = String(req.headers["idempotency-key"] || "");
      if (!key)
        return res.status(400).json({ message: "Idempotency key is required" });
      const existing = await Contribution.findOne({
        idempotencyKey: key,
      }).session(session);
      if (existing) {
        await session.abortTransaction();
        return res.json(existing);
      }
      const c = await Campaign.findOne({
        _id: req.body.campaignId,
        status: "approved",
        deadline: { $gt: new Date() },
      }).session(session);
      const amount = Number(req.body.amount);
      if (!c || !Number.isFinite(amount))
        return res.status(404).json({ message: "Active campaign not found" });
      if (amount < (c.minimumContribution ?? 1))
        return res
          .status(400)
          .json({ message: "Contribution is below the minimum" });
      const u = await User.findOneAndUpdate(
        { email: req.user!.email, credits: { $gte: amount } },
        { $inc: { credits: -amount } },
        { new: true, session },
      );
      if (!u) return res.status(400).json({ message: "Insufficient credits" });
      const contribution = await Contribution.create(
        [
          {
            campaignId: c._id,
            campaignTitle: c.title,
            amount,
            message: String(req.body.message || "").slice(0, 500),
            idempotencyKey: key,
            supporterEmail: u.email,
            supporterName: u.name,
            creatorName: c.creatorName,
            creatorEmail: c.creatorEmail,
            status: "pending",
          },
        ],
        { session },
      );
      await Notification.create(
        [
          {
            toEmail: c.creatorEmail,
            message: `${u.name} contributed ${amount} credits to ${c.title}.`,
            actionRoute: "/dashboard",
          },
        ],
        { session },
      );
      await session.commitTransaction();
      res.status(201).json(contribution[0]);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  },
);
router.get("/contributions", auth, async (req: AuthRequest, res) => {
  const q =
    req.user!.role === "supporter"
      ? { supporterEmail: req.user!.email }
      : req.user!.role === "creator"
        ? { creatorEmail: req.user!.email }
        : {};
  const page = Math.max(1, Number(req.query.page) || 1),
    limit = 10;
  const [items, total] = await Promise.all([
    Contribution.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Contribution.countDocuments(q),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});
router.patch(
  "/contributions/:id",
  auth,
  allow("creator"),
  async (req: AuthRequest, res) => {
    if (!["approved", "rejected"].includes(req.body.status))
      return res.status(400).json({message:"Invalid contribution status"});
    const mongoose = (await import("mongoose")).default;
    const session = await mongoose.startSession();
    let c: any;
    try {
      session.startTransaction();
      c = await Contribution.findOneAndUpdate(
        {_id:req.params.id,creatorEmail:req.user!.email,status:"pending"},
        {$set:{status:req.body.status}},
        {new:true,session},
      );
      if (!c) {
        await session.abortTransaction();
        return res.status(404).json({message:"Pending contribution not found"});
      }
      if (c.status === "approved") {
        await Campaign.updateOne({_id:c.campaignId},{$inc:{raised:c.amount}},{session});
        await User.updateOne({email:c.creatorEmail},{$inc:{raisedCredits:c.amount}},{session});
      } else {
        await User.updateOne({email:c.supporterEmail},{$inc:{credits:c.amount}},{session});
        await Contribution.updateOne({_id:c._id},{$set:{refunded:true}},{session});
      }
      await session.commitTransaction();
    } finally {
      await session.endSession();
    }
    await Notification.create({
      toEmail: c.supporterEmail,
      message: `Your contribution of ${c.amount} credits to ${c.campaignTitle} was ${c.status} by ${c.creatorName}.`,
      actionRoute: "/dashboard",
    });
    await sendEmail(
      c.supporterEmail ?? "",
      `Your Fundora contribution was ${c.status}`,
      `<p>Your contribution to <b>${c.campaignTitle}</b> was ${c.status}.</p>`,
    );
    res.json(c);
  },
);
router.post(
  "/payments/checkout",
  auth,
  allow("supporter"),
  async (req: AuthRequest, res) => {
    const packs: any = { 100: 10, 300: 25, 800: 60, 1500: 110 };
    const credits = Number(req.body.credits),
      amount = packs[credits];
    if (!amount)
      return res.status(400).json({ message: "Invalid credit package" });
    if (!stripe)
      return res.status(503).json({ message: "Stripe is not configured" });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: { name: `Fundora ${credits} credit pack` },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: { email: req.user!.email, credits: String(credits) },
    });
    await Payment.create({
      userEmail: req.user!.email,
      credits,
      amount,
      stripeSessionId: session.id,
      status: "pending",
    });
    res.json({ url: session.url });
  },
);
router.post(
  "/withdrawals",
  auth,
  allow("creator"),
  async (req: AuthRequest, res) => {
    const credits = Number(req.body.credits),
      u = await User.findOne({ email: req.user!.email });
    if (!u || credits < 200 || credits > u.raisedCredits)
      return res
        .status(400)
        .json({
          message: "Minimum is 200 credits and cannot exceed raised balance",
        });
    res
      .status(201)
      .json(
        await Withdrawal.create({
          creatorEmail: u.email,
          creatorName: u.name,
          credits,
          amount: credits / 20,
          paymentSystem: req.body.paymentSystem,
          accountNumber: req.body.accountNumber,
          status: "pending",
        }),
      );
  },
);
router.get("/withdrawals", auth, async (req: AuthRequest, res) => {
  const q = req.user!.role === "admin" ? {} : { creatorEmail: req.user!.email };
  res.json(await Withdrawal.find(q).sort({ createdAt: -1 }));
});
router.get("/payments", auth, async (req: AuthRequest, res) =>
  res.json(
    await Payment.find({ userEmail: req.user!.email }).sort({ createdAt: -1 }),
  ),
);
router.patch(
  "/withdrawals/:id/approve",
  auth,
  allow("admin"),
  async (req, res) => {
    const mongoose = (await import("mongoose")).default;
    const session = await mongoose.startSession();
    session.startTransaction();
    const w = await Withdrawal.findOneAndUpdate({_id:req.params.id,status:"pending"},{$set:{status:"approved"}},{new:true,session});
    if (!w){await session.abortTransaction();await session.endSession();return res.status(404).json({ message: "Request not found" });}
    const creator=await User.findOneAndUpdate({email:w.creatorEmail,raisedCredits:{$gte:w.credits??0}},{$inc:{raisedCredits:-(w.credits??0)}},{new:true,session});
    if(!creator){await session.abortTransaction();return res.status(400).json({message:"Creator no longer has enough raised credits"});}
    await session.commitTransaction();await session.endSession();
    await Notification.create({
      toEmail: w.creatorEmail,
      message: `Your withdrawal of $${w.amount} was approved.`,
      actionRoute: "/dashboard",
    });
    res.json(w);
  },
);
router.get("/notifications", auth, async (req: AuthRequest, res) =>
  res.json(
    await Notification.find({ toEmail: req.user!.email })
      .sort({ createdAt: -1 })
      .limit(30),
  ),
);
router.patch("/notifications/:id/read", auth, async (req: AuthRequest, res) =>
  res.json(
    await Notification.findOneAndUpdate(
      { _id: req.params.id, toEmail: req.user!.email },
      { isRead: true },
      { new: true },
    ),
  ),
);
router.patch("/notifications/read-all", auth, async (req: AuthRequest, res) => {
  await Notification.updateMany(
    { toEmail: req.user!.email, isRead: false },
    { isRead: true },
  );
  res.json({ message: "Notifications marked as read" });
});
export default router;
