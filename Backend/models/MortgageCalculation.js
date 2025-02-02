const mongoose = require("mongoose");

const mortgageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loanAmount: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true }, // En decimal
    loanTermYears: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    totalInterestPaid: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MortgageCalculation", mortgageSchema);
