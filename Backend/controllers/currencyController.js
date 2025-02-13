const axios = require("axios");

// 📌 Convertir moneda
exports.convertCurrency = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.query;

    // Validaciones básicas
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ error: "⚠️ Debes proporcionar 'amount', 'fromCurrency' y 'toCurrency'." });
    }

    // Construir la URL de la API con la clave
    const API_URL = `${process.env.EXCHANGE_API_URL}${process.env.EXCHANGE_API_KEY}/latest/${fromCurrency}`;

    // Obtener tasas de cambio
    const response = await axios.get(API_URL);
    const rates = response.data.conversion_rates;

    if (!rates[toCurrency]) {
      return res.status(400).json({ error: `⚠️ La moneda '${toCurrency}' no es válida.` });
    }

    // Calcular conversión
    const exchangeRate = rates[toCurrency];
    const convertedAmount = (parseFloat(amount) * exchangeRate).toFixed(2);

    res.json({
      message: "✅ Conversión realizada con éxito.",
      from: fromCurrency,
      to: toCurrency,
      amount: parseFloat(amount),
      convertedAmount,
      exchangeRate
    });

  } catch (error) {
    res.status(500).json({ error: "⚠️ Error al obtener las tasas de cambio.", detalle: error.message });
  }
};
