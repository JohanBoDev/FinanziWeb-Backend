const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loanAmount: { type: Number, required: true }, // Monto del préstamo
    annualInterestRate: { type: Number, required: true }, // Tasa de interés anual en decimal
    monthlyPayment: { type: Number, required: true }, // Pago mensual esperado
    totalPayments: { type: Number, required: true }, // Número total de pagos
    dueDate: { type: Date, required: true }, // Fecha de vencimiento del próximo pago
    remainingBalance: { type: Number, required: true }, // Saldo pendiente
    paidAmount: { type: Number, default: 0 }, // Total pagado hasta el momento
    strategy: { type: String, enum: ["avalancha", "bola de nieve"], default: "avalancha" }, // Estrategia de pago
    status: { type: String, enum: ["activa", "completada"], default: "activa" } // Estado de la deuda
  },
  { timestamps: true }
);

module.exports = mongoose.model("Debt", debtSchema);
