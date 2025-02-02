const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loanAmount: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true }, // En decimal (ej. 0.07 para 7%)
    monthlyPayment: { type: Number, required: true },
    totalPayments: { type: Number, required: true }, // Número de meses
    totalInterestPaid: { type: Number, required: true },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DebtCalculation", debtSchema);
