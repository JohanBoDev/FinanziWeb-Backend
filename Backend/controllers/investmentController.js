const InvestmentCalculation = require("../models/InvestmentCalculation");

// 📌 Función para formatear en pesos colombianos (COP)
const formatToCOP = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2
  }).format(value);
};


// 📌 Crear un cálculo de inversión (opcionalmente guardarlo)
const createInvestment = async (req, res) => {
  try {
      if(!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        };

    const userId = req.user.userId;


    const { initialInvestment, monthlyContribution, annualReturnRate, investmentYears, save } = req.body;

    // Cálculo del valor futuro usando interés compuesto
    const months = investmentYears * 12;
    let finalValue = initialInvestment;
    for (let i = 0; i < months; i++) {
      finalValue += monthlyContribution;
      finalValue *= (1 + annualReturnRate / 12);
    }
    const totalGains = finalValue - (initialInvestment + monthlyContribution * months);

    // Construcción del objeto de respuesta
    const result = {
      initialInvestment: formatToCOP(initialInvestment),
      monthlyContribution: formatToCOP(monthlyContribution),
      annualReturnRate: `${(annualReturnRate * 100).toFixed(2)}%`,
      investmentYears,
      finalValue: formatToCOP(finalValue),
      totalGains: formatToCOP(totalGains)
    };

    // Si el usuario decide guardar el cálculo
    if (save) {
      const investment = new InvestmentCalculation({
        userId,
        initialInvestment,
        monthlyContribution,
        annualReturnRate,
        investmentYears,
        finalValue,
        totalGains,
        saved: true
      });
      await investment.save();
      return res.status(201).json({ message: "Cálculo guardado", data: result });
    }

    // Si el usuario solo quiere ver el cálculo sin guardarlo
    res.status(200).json({ message: "Cálculo realizado sin guardar", data: result });
  } catch (error) {
    res.status(500).json({ message: "Error al calcular la inversión", error: error.message });
  }
};

// 📌 Obtener todos los cálculos guardados del usuario
const getInvestments = async (req, res) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
  
      const userId = req.user.userId;
      const investments = await InvestmentCalculation.find({ userId });
  
      // Si no hay cálculos de inversión, enviamos respuesta aquí mismo y detenemos la ejecución
      if (!investments.length) {
        return res.status(200).json({ message: "No se encontraron cálculos de inversión.", data: [] });
      }
  
      // Formatear los valores en COP antes de enviar la respuesta
      const formattedInvestments = investments.map((inv) => ({
        ...inv._doc,
        initialInvestment: formatToCOP(inv.initialInvestment),
        monthlyContribution: formatToCOP(inv.monthlyContribution),
        annualReturnRate: `${(inv.annualReturnRate * 100).toFixed(2)}%`,
        finalValue: formatToCOP(inv.finalValue),
        totalGains: formatToCOP(inv.totalGains)
      }));
  
      res.json(formattedInvestments);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener inversiones", error: error.message });
    }
  };
  

// 📌 Obtener un cálculo de inversión por ID
const getInvestmentById = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
    }
    const userId = req.user.userId;
    const investment = await InvestmentCalculation.findById(req.params.id);
    if (!investment || investment.userId.toString() !== userId) {
      return res.status(404).json({ message: "Cálculo no encontrado" });
    }

    // Formatear la salida en pesos colombianos
    const formattedInvestment = {
      ...investment._doc,
      initialInvestment: formatToCOP(investment.initialInvestment),
      monthlyContribution: formatToCOP(investment.monthlyContribution),
      annualReturnRate: `${(investment.annualReturnRate * 100).toFixed(2)}%`,
      finalValue: formatToCOP(investment.finalValue),
      totalGains: formatToCOP(investment.totalGains)
    };

    res.json(formattedInvestment);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la inversión", error: error.message });
  }
};

// 📌 Actualizar un cálculo de inversión
const updateInvestment = async (req, res) => {
  try {
    if(!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
    }
    const userId = req.user.userId;
    const investment = await InvestmentCalculation.findById(req.params.id);
    if (!investment || investment.userId.toString() !== userId) {
      return res.status(404).json({ message: "Cálculo no encontrado" });
    }

    const { initialInvestment, monthlyContribution, annualReturnRate, investmentYears, saved } = req.body;

    investment.initialInvestment = initialInvestment ?? investment.initialInvestment;
    investment.monthlyContribution = monthlyContribution ?? investment.monthlyContribution;
    investment.annualReturnRate = annualReturnRate ?? investment.annualReturnRate;
    investment.investmentYears = investmentYears ?? investment.investmentYears;
    investment.saved = saved ?? investment.saved;

    // Recalcular el valor final
    const months = investment.investmentYears * 12;
    let finalValue = investment.initialInvestment;
    for (let i = 0; i < months; i++) {
      finalValue += investment.monthlyContribution;
      finalValue *= (1 + investment.annualReturnRate / 12);
    }
    investment.finalValue = finalValue;
    investment.totalGains = finalValue - (investment.initialInvestment + investment.monthlyContribution * months);

    await investment.save();

    // Formatear los datos en COP
    const formattedInvestment = {
      ...investment._doc,
      initialInvestment: formatToCOP(investment.initialInvestment),
      monthlyContribution: formatToCOP(investment.monthlyContribution),
      annualReturnRate: `${(investment.annualReturnRate * 100).toFixed(2)}%`,
      finalValue: formatToCOP(investment.finalValue),
      totalGains: formatToCOP(investment.totalGains)
    };

    res.json({ message: "Cálculo actualizado", data: formattedInvestment });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la inversión", error: error.message });
  }
};

// 📌 Eliminar un cálculo de inversión
const deleteInvestment = async (req, res) => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
  
      const investment = await InvestmentCalculation.findById(req.params.id);
      if (!investment || investment.userId.toString() !== userId) {
        return res.status(404).json({ message: "Cálculo no encontrado" });
      }
  
      // Usar deleteOne en lugar de remove()
      await InvestmentCalculation.deleteOne({ _id: req.params.id });
  
      res.json({ message: "Cálculo de inversión eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la inversión", error: error.message });
    }
  };
  

// 📌 Exportación de controladores en la misma función
module.exports = {
  createInvestment,
  getInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment
};
