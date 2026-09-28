const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true
    },

    teamName: {
      type: String,
      required: true,
      trim: true
    },

    collegeName: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    member1: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      mobile: {
        type: String,
        required: true
      }
    },

    member2: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      mobile: {
        type: String,
        required: true
      }
    },

    paymentMode: {
      type: String,
      enum: ["online", "offline"],
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "verified",
        "rejected",
        "offline-paid"
      ],
      default: "pending"
    },

    utrId: {
      type: String,
      sparse: true,
      unique: true
    },

    paidAt: Date,

    confirmationCode: String,

    confirmationSentAt: Date,

    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    notes: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);