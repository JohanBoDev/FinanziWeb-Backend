const express = require("express");
const { createDebt, getDebts, payDebt, deleteDebt, simulateDebtPayments, calculateDebtStrategy } = require("../controllers/debtManagementController");
const {verificarToken} = require("../middleware/auth");

const router = express.Router();

router.post("/", verificarToken, createDebt); // Crear deuda
router.get("/", verificarToken, getDebts); // Obtener deudas
router.put("/:id/pay", verificarToken, payDebt); // Registrar pago
router.delete("/:id", verificarToken, deleteDebt); // Eliminar deuda
router.post("/simulate", verificarToken, simulateDebtPayments); // Simular pagos
router.get("/strategy", verificarToken, calculateDebtStrategy); // Calcular estrategia

module.exports = router;
