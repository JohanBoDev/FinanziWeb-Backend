const express = require("express");
const router = express.Router();
const { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, importExpensesFromCSV, getExpenseReport } = require("../controllers/expenseController");
const { verificarToken } = require("../middleware/auth");
const upload = require("../middleware/uploadFiles");

// Rutas de gastos
router.get("/report", verificarToken, getExpenseReport);
router.post("/", verificarToken, createExpense);
router.get("/", verificarToken, getExpenses);
router.get("/:id", verificarToken, getExpenseById);
router.put("/:id", verificarToken, updateExpense);
router.delete("/:id", verificarToken, deleteExpense);
router.post("/import", verificarToken, upload.single("file"), importExpensesFromCSV);

module.exports = router;