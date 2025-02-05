const MortgageCalculation = require("../models/MortgageCalculation");

// Función para calcular el pago mensual de una hipoteca
const calculateMortgage = (loanAmount, annualInterestRate, loanTermYears) => {
  const monthlyInterestRate = annualInterestRate / 12; // Convertir a tasa mensual
  const totalPayments = loanTermYears * 12; // Número total de pagos

  const monthlyPayment =
    (loanAmount * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -totalPayments));

  const totalCost = monthlyPayment * totalPayments;
  const totalInterestPaid = totalCost - loanAmount;

  return { monthlyPayment, totalCost, totalInterestPaid };
};

// Función para formatear a COP
const formatToCOP = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount);
};

// 📌 **Crear un cálculo de hipoteca**
exports.createMortgageCalculation = async (req, res) => {
  try {
    const { loanAmount, annualInterestRate, loanTermYears } = req.body;

    // 🔹 Verificar si el usuario está autenticado y tiene un ID válido
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }
    const userId = req.user.userId;

    // 🔹 Validar los datos de entrada
    if (!loanAmount || !annualInterestRate || !loanTermYears) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // 🔹 Calcular los valores de la hipoteca
    const { monthlyPayment, totalCost, totalInterestPaid } = calculateMortgage(
      loanAmount,
      annualInterestRate / 100,
      loanTermYears
    );

    // 🔹 Crear el objeto de hipoteca
    const mortgageCalc = new MortgageCalculation({
      userId,
      loanAmount,
      annualInterestRate,
      loanTermYears,
      monthlyPayment,
      totalInterestPaid,
      totalCost,
      saved: true,
    });

    // 🔹 Guardar en la base de datos
    await mortgageCalc.save();

    res.status(201).json({
      _id: mortgageCalc._id,
      userId: mortgageCalc.userId,
      loanAmount: formatToCOP(loanAmount),
      annualInterestRate: `${annualInterestRate}%`,
      loanTermYears,
      monthlyPayment: formatToCOP(monthlyPayment),
      totalInterestPaid: formatToCOP(totalInterestPaid),
      totalCost: formatToCOP(totalCost),
      saved: mortgageCalc.saved,
      message: `Pago mensual: ${formatToCOP(
        monthlyPayment
      )}, Total a pagar: ${formatToCOP(totalCost)}`,
    });
  } catch (error) {
    console.error("❌ Error al calcular la hipoteca:", error);
    res
      .status(500)
      .json({ message: "Error al calcular la hipoteca", error: error.message });
  }
};

// 📌 **Obtener todos los cálculos de hipoteca de un usuario**
exports.getUserMortgageCalculations = async (req, res) => {
    try {
        // 🔹 Verificar si el usuario está autenticado
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        const userId = req.user.userId;

        // 🔹 Buscar cálculos de hipoteca del usuario autenticado
        const calculations = await MortgageCalculation.find({ userId });

        if (!calculations.length) {
            return res.status(200).json({ message: "No se encontraron cálculos de hipoteca.", deudas: [] });
        }

        // 🔹 Formatear la respuesta antes de enviarla
        const formattedCalculations = calculations.map(calc => ({
            _id: calc._id,
            userId: calc.userId,
            loanAmount: formatToCOP(calc.loanAmount),
            annualInterestRate: `${calc.annualInterestRate}%`,
            loanTermYears: calc.loanTermYears,
            monthlyPayment: formatToCOP(calc.monthlyPayment),
            totalInterestPaid: formatToCOP(calc.totalInterestPaid),
            totalCost: formatToCOP(calc.totalCost),
            saved: calc.saved,
            createdAt: calc.createdAt
        }));

        res.status(200).json({
            message: "Lista de cálculos de hipoteca obtenida con éxito",
            hipotecas: formattedCalculations
        });

    } catch (error) {
        console.error("❌ Error al obtener cálculos de hipoteca:", error);
        res.status(500).json({ message: "Error al obtener cálculos de hipoteca", error: error.message });
    }
};


// 📌 **Obtener un cálculo de hipoteca por ID**
exports.getMortgageCalculationById = async (req, res) => {
  try {
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const userId = req.user.userId;

    const calculation = await MortgageCalculation.findById(req.params.id);

    if (!calculation) {
      return res.status(404).json({ message: "Cálculo no encontrado" });
    }

    res.status(200).json({
      _id: calculation._id,
      userId: calculation.userId,
      loanAmount: formatToCOP(calculation.loanAmount),
      annualInterestRate: `${calculation.annualInterestRate}%`,
      loanTermYears: calculation.loanTermYears,
      monthlyPayment: formatToCOP(calculation.monthlyPayment),
      totalInterestPaid: formatToCOP(calculation.totalInterestPaid),
      totalCost: formatToCOP(calculation.totalCost),
      saved: calculation.saved,
    });
  } catch (error) {
    console.error("❌ Error al obtener el cálculo:", error);
    res.status(500).json({ message: "Error al obtener el cálculo", error });
  }
};

// 📌 **Eliminar un cálculo de hipoteca**
exports.deleteMortgageCalculation = async (req, res) => {
    try {
      // 🔹 Verificar si el cálculo existe antes de eliminarlo
      const mortgage = await MortgageCalculation.findById(req.params.id);
  
      if (!mortgage) {
        return res.status(404).json({ message: "Cálculo de hipoteca no encontrado" });
      }
  
      // 🔹 Eliminar el cálculo si existe
      await MortgageCalculation.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: "Cálculo de hipoteca eliminado exitosamente" });
  
    } catch (error) {
      console.error("❌ Error al eliminar el cálculo:", error);
      res.status(500).json({ message: "Error al eliminar el cálculo", error: error.message });
    }
  };
  
