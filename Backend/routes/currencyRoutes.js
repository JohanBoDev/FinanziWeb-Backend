const express = require("express");
const { convertCurrency } = require("../controllers/currencyController");

const router = express.Router();

// 📌 Endpoint para convertir moneda
router.get("/convert", convertCurrency);

module.exports = router;
