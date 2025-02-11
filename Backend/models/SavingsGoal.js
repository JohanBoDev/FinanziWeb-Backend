const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goalName: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    saved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);

