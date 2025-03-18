const express = require("express");
const { convertCurrency, getCurrencies } = require("../controllers/currencyController");

const router = express.Router();

// 📌 Endpoint para convertir moneda
router.get("/convert", convertCurrency);

// 📌 Endpoint para obtener lista de monedas
router.get("/currencies", getCurrencies);

module.exports = router;
