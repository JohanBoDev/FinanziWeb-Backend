const express = require("express");
const router = express.Router();
const { createBudget, getBudgets, updateBudget, deleteBudget, getBudgetById } = require("../controllers/budgetController");
const {verificarToken} = require("../middleware/auth");

router.post("/", verificarToken, createBudget);
router.get("/", verificarToken, getBudgets);
router.get("/:budgetId", verificarToken, getBudgetById);
router.put("/:budgetId", verificarToken, updateBudget);
router.delete("/:budgetId", verificarToken, deleteBudget);

module.exports = router;
