const DebtCalculation = require("../models/DebtCalculation");

// 🔹 Función para formatear valores en COP
const formatCOP = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
}).format(value);

// 📌 Crear un nuevo cálculo de deuda
exports.createDebt = async (req, res) => {
  try {
    const { loanAmount, annualInterestRate, monthlyPayment } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const userId = req.user.userId;

    if (!loanAmount || !annualInterestRate || !monthlyPayment) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // 🔹 Convertir tasa anual a tasa mensual
    const monthlyInterestRate = annualInterestRate / 12;

    // 🔹 Calcular el número total de pagos (meses)
    const totalPayments = Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyInterestRate)) / Math.log(1 + monthlyInterestRate);

    // 🔹 Calcular el total de intereses pagados
    const totalInterestPaid = (monthlyPayment * Math.ceil(totalPayments)) - loanAmount;

    // 🔹 Guardar en la base de datos
    const newDebt = new DebtCalculation({
      userId,
      loanAmount,
      annualInterestRate,
      monthlyPayment,
      totalPayments: Math.ceil(totalPayments), // Redondeamos al mes siguiente si es fraccionario
      totalInterestPaid: totalInterestPaid.toFixed(2),
      saved: true,
    });

    await newDebt.save();
    res.status(201).json({
      message: "Cálculo de deuda guardado con éxito",
      deuda: {
        _id: newDebt._id,
        loanAmount: formatCOP(newDebt.loanAmount),
        annualInterestRate: `${(newDebt.annualInterestRate * 100).toFixed(2)}%`,
        monthlyPayment: formatCOP(newDebt.monthlyPayment),
        totalPayments: newDebt.totalPayments,
        totalInterestPaid: formatCOP(newDebt.totalInterestPaid),
        createdAt: newDebt.createdAt,
      },
    });

  } catch (error) {
    console.error("🔥 Error en createDebt:", error);
    res.status(500).json({ message: "Error al calcular la deuda", error: error.message });
  }
};

// 📌 Obtener todos los cálculos de deuda del usuario
exports.getAllDebts = async (req, res) => {
  try {
    const debts = await DebtCalculation.find({ userId: req.user.userId });

    const formattedDebts = debts.map(debt => ({
      _id: debt._id,
      loanAmount: formatCOP(debt.loanAmount),
      annualInterestRate: `${(debt.annualInterestRate * 100).toFixed(2)}%`,
      monthlyPayment: formatCOP(debt.monthlyPayment),
      totalPayments: debt.totalPayments,
      totalInterestPaid: formatCOP(debt.totalInterestPaid),
      createdAt: debt.createdAt,
    }));

    res.status(200).json({
      message: "Lista de cálculos de deuda obtenida con éxito",
      deudas: formattedDebts,
    });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener los cálculos de deuda", error: error.message });
  }
};

// 📌 Obtener un cálculo de deuda por ID
exports.getDebtById = async (req, res) => {
  try {
    const debt = await DebtCalculation.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({ message: "Cálculo de deuda no encontrado" });
    }

    const formattedDebt = {
      _id: debt._id,
      loanAmount: formatCOP(debt.loanAmount),
      annualInterestRate: `${(debt.annualInterestRate * 100).toFixed(2)}%`,
      monthlyPayment: formatCOP(debt.monthlyPayment),
      totalPayments: debt.totalPayments,
      totalInterestPaid: formatCOP(debt.totalInterestPaid),
      createdAt: debt.createdAt,
    };

    res.status(200).json({
      message: "Cálculo de deuda encontrado",
      deuda: formattedDebt,
    });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener el cálculo de deuda", error: error.message });
  }
};

// 📌 Actualizar un cálculo de deuda
exports.updateDebt = async (req, res) => {
  try {
    const existingDebt = await DebtCalculation.findById(req.params.id);

    if (!existingDebt) {
      return res.status(404).json({ message: "Cálculo de deuda no encontrado" });
    }

    const loanAmount = req.body.loanAmount ?? existingDebt.loanAmount;
    const annualInterestRate = req.body.annualInterestRate ?? existingDebt.annualInterestRate;
    const monthlyPayment = req.body.monthlyPayment ?? existingDebt.monthlyPayment;

    const monthlyInterestRate = annualInterestRate / 12;
    const totalPayments = Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyInterestRate)) / Math.log(1 + monthlyInterestRate);
    const totalInterestPaid = (monthlyPayment * Math.ceil(totalPayments)) - loanAmount;

    const updatedDebt = await DebtCalculation.findByIdAndUpdate(
      req.params.id,
      {
        loanAmount,
        annualInterestRate,
        monthlyPayment,
        totalPayments: Math.ceil(totalPayments),
        totalInterestPaid: totalInterestPaid.toFixed(2),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Cálculo de deuda actualizado correctamente",
      deuda: {
        _id: updatedDebt._id,
        loanAmount: formatCOP(updatedDebt.loanAmount),
        annualInterestRate: `${(updatedDebt.annualInterestRate * 100).toFixed(2)}%`,
        monthlyPayment: formatCOP(updatedDebt.monthlyPayment),
        totalPayments: updatedDebt.totalPayments,
        totalInterestPaid: formatCOP(updatedDebt.totalInterestPaid),
        updatedAt: updatedDebt.updatedAt,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el cálculo de deuda", error: error.message });
  }
};

// 📌 Eliminar un cálculo de deuda
exports.deleteDebt = async (req, res) => {
  try {
    const debt = await DebtCalculation.findByIdAndDelete(req.params.id);

    if (!debt) {
      return res.status(404).json({ message: "Cálculo de deuda no encontrado" });
    }

    res.status(200).json({ message: "Cálculo de deuda eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el cálculo de deuda", error: error.message });
  }
};
