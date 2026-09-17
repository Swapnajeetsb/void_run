const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true, index: true },
    teamName: { type: String, required: true, trim: true, index: true },
    member1: { type: memberSchema, required: true },
    member2: { type: memberSchema, required: true },
    paymentMode: { type: String, enum: ["online", "offline"], required: true },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "verified", "rejected", "offline-paid"],
      default: "pending"
    },
    utrId: { type: String, trim: true, default: undefined },
    paidAt: { type: Date, default: null },
    confirmationCode: { type: String, required: true, unique: true },
    confirmationSentAt: { type: Date, default: null },
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

registrationSchema.index({ utrId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Registration", registrationSchema);
