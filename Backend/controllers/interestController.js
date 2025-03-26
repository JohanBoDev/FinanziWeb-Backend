const InterestCalculations = require("../models/InterestCalculation");
const jwt = require("jsonwebtoken");

// Función para calcular el interés
const calculateInterest = (principal, rate, time, type) => {
  if (type === "simple") {
    const interestEarned = principal * rate * time;
    const finalAmount = principal + interestEarned;
    return { finalAmount, interestEarned };
  } else {
    const finalAmount = principal * Math.pow(1 + rate, time);
    const interestEarned = finalAmount - principal;
    return { finalAmount, interestEarned };
  }
};

// Función para formatear a COP
const formatToCOP = (amount) => {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(amount);
};


// Crear un cálculo de interés
exports.createInterestCalculation = async (req, res) => {
  try {
    const { principal, interestRate, timeInYears, interestType, saved = false } = req.body;

    const { finalAmount, interestEarned } = calculateInterest(principal, interestRate, timeInYears, interestType);

    let userId = null;
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (saved) {
      if (!token) {
        return res.status(401).json({ message: "Debes iniciar sesión para guardar el cálculo." });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        return res.status(401).json({ message: "Token inválido para guardar el cálculo." });
      }
    }

    if (saved && userId) {
      const interestCalc = new InterestCalculations({
        userId,
        principal,
        interestRate,
        timeInYears,
        interestType,
        finalAmount,
        interestEarned,
        saved: true
      });

      await interestCalc.save();

      return res.status(201).json({
        ...interestCalc._doc,
        principal: formatToCOP(principal),
        finalAmount: formatToCOP(finalAmount),
        interestEarned: formatToCOP(interestEarned),
        message: "✅ Cálculo guardado. Tus ganancias serían de " + formatToCOP(interestEarned)
      });
    }

    return res.status(200).json({
      principal: formatToCOP(principal),
      finalAmount: formatToCOP(finalAmount),
      interestEarned: formatToCOP(interestEarned),
      message: "🧮 Cálculo realizado. Tus ganancias serían de " + formatToCOP(interestEarned)
    });

  } catch (error) {
    res.status(500).json({ message: "Error al calcular el interés", error: error.message });
  }
};


  
// Obtener cálculos de interés por usuario
exports.getUserInterestCalculations = async (req, res) => {
  try {
    console.log("🔍 Iniciando búsqueda de cálculos de interés...");

    if (!req.user || !req.user.userId) {
      console.error("🚨 Error: No se encontró el usuario en la request.", req.user);
      return res.status(400).json({ message: "Usuario no autenticado." });
    }

    console.log("🆔 ID del usuario extraído del token:", req.user.userId);

    const calculations = await InterestCalculations.find({ userId: req.user.userId });

    console.log("📊 Resultados obtenidos:", calculations);

    if (calculations.length === 0) {
      console.warn("⚠️ No se encontraron cálculos para este usuario.");
      return res.status(404).json({ message: "No se encontraron cálculos de interés." });
    }

    res.status(200).json(calculations);
  } catch (error) {
    console.error("❌ Error al obtener cálculos de interés:", error);
    res.status(500).json({ message: "Error al obtener cálculos", error });
  }
};

// Obtener un cálculo de interés por ID
exports.getInterestCalculationById = async (req, res) => {
  try {
    console.log("🔍 Iniciando búsqueda de cálculo de interés por ID...");

    if (!req.params.id) {
      console.error("🚨 Error: No se proporcionó un ID en la request.");
      return res.status(400).json({ message: "ID no proporcionado" });
    }

    console.log("🆔 ID recibido:", req.params.id);

    // Ahora usando el nombre correcto del modelo
    const calculation = await InterestCalculations.findById(req.params.id);

    console.log("📊 Resultado de la búsqueda:", calculation);

    if (!calculation) {
      console.warn("⚠️ No se encontró un cálculo de interés con este ID.");
      return res.status(404).json({ message: "Cálculo no encontrado" });
    }

    const formattedCalculation = {
      ...calculation._doc,
      principal: formatToCOP(calculation.principal),
      finalAmount: formatToCOP(calculation.finalAmount),
      interestEarned: formatToCOP(calculation.interestEarned),
    };

    console.log("✅ Cálculo encontrado y formateado:", formattedCalculation);

    res.status(200).json(formattedCalculation);
  } catch (error) {
    console.error("❌ Error al obtener el cálculo:", error);
    res.status(500).json({ message: "Error al obtener el cálculo", error });
  }
};

// Eliminar un cálculo de interés
exports.deleteInterestCalculation = async (req, res) => {
  try {
    await InterestCalculations.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cálculo eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el cálculo", error });
  }
};


