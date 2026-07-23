import mongoose, { Schema } from "mongoose";
const opts = { timestamps: true };
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    photo: String,
    role: {
      type: String,
      enum: ["supporter", "creator", "admin"],
      default: "supporter",
    },
    credits: { type: Number, default: 0 },
    raisedCredits: { type: Number, default: 0 },
  },
  opts,
);
const campaignSchema = new Schema(
  {
    title: { type: String, required: true },
    story: { type: String, required: true },
    category: String,
    goal: Number,
    minimumContribution: Number,
    deadline: Date,
    reward: String,
    image: String,
    raised: { type: Number, default: 0 },
    creatorName: String,
    creatorEmail: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
  },
  opts,
);
const contributionSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    campaignTitle: String,
    amount: Number,
    message: { type: String, maxlength: 500 },
    idempotencyKey: { type: String, unique: true, sparse: true },
    supporterEmail: String,
    supporterName: String,
    creatorName: String,
    creatorEmail: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    refunded: { type: Boolean, default: false },
  },
  opts,
);
const paymentSchema = new Schema(
  {
    userEmail: String,
    credits: Number,
    amount: Number,
    stripeSessionId: { type: String, unique: true, sparse: true },
    status: { type: String, default: "pending" },
  },
  opts,
);
const withdrawalSchema = new Schema(
  {
    creatorEmail: String,
    creatorName: String,
    credits: Number,
    amount: Number,
    paymentSystem: String,
    accountNumber: String,
    status: { type: String, default: "pending" },
  },
  opts,
);
const notificationSchema = new Schema(
  {
    message: String,
    toEmail: String,
    actionRoute: String,
    isRead: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
  },
  opts,
);
const reportSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    campaignTitle: String,
    reporterName: String,
    reporterEmail: String,
    reason: String,
    status: { type: String, default: "open" },
  },
  opts,
);
export const User = mongoose.model("User", userSchema);
export const Campaign = mongoose.model("Campaign", campaignSchema);
export const Contribution = mongoose.model("Contribution", contributionSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
export const Report = mongoose.model("Report", reportSchema);
