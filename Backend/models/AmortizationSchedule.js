const mongoose = require("mongoose");

const amortizationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loanAmount: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true },
    loanTermYears: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    schedule: [
      {
        month: { type: Number, required: true },
        payment: { type: Number, required: true },
        interest: { type: Number, required: true },
        principal: { type: Number, required: true },
        remainingBalance: { type: Number, required: true }
      }
    ],
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AmortizationSchedule", amortizationSchema);
