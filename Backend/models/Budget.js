const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  month: { type: String, required: true }, // Ej: "Febrero 2025"
  income: { type: Number, required: true },
  categoryAllocations: [
    {
      category: { type: String, required: true },
      allocatedAmount: { type: Number, required: true },
      actualSpent: { type: Number, default: 0 },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Budget", budgetSchema);