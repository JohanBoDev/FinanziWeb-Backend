const mongoose = require("mongoose");

const savingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    initialAmount: { type: Number, required: true },
    monthlyContribution: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // En decimal (ej. 0.05 para 5%)
    compoundFrequency: { type: Number, required: true }, // Ejemplo: 12 para mensual
    timeInYears: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    interestEarned: { type: Number, required: true },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavingsCalculation", savingsSchema);
