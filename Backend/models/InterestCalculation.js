const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    principal: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // En decimal
    timeInYears: { type: Number, required: true },
    interestType: { type: String, enum: ["simple", "compound"], required: true },
    finalAmount: { type: Number, required: true },
    interestEarned: { type: Number, required: true },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterestCalculation", interestSchema);
