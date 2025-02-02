const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    initialInvestment: { type: Number, required: true },
    monthlyContribution: { type: Number, required: true },
    annualReturnRate: { type: Number, required: true }, // En decimal
    investmentYears: { type: Number, required: true },
    finalValue: { type: Number, required: true },
    totalGains: { type: Number, required: true },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvestmentCalculation", investmentSchema);
