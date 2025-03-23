const DebtCalculation = require("../models/DebtCalculation");
const jwt = require("jsonwebtoken");

// 🔹 Función para formatear valores en COP
const formatCOP = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
}).format(value);

// 📌 Crear un nuevo cálculo de deuda
exports.createDebt = async (req, res) => {
  try {
    const {
      loanAmount,
      annualInterestRate,
      monthlyPayment,
      saved = false, // ✅ viene desde el frontend
    } = req.body;

    let userId = null;

    // 🔐 Verificar token solo si quiere guardar
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        userId = decoded.userId;
      } catch (err) {
        if (saved === true) {
          return res.status(401).json({
            message: "Para guardar el cálculo debes iniciar sesión.",
          });
        }
        // Si no quiere guardar, ignoramos error del token
      }
    }

    // 🧾 Validaciones básicas
    if (!loanAmount || !annualInterestRate || !monthlyPayment) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // 🔹 Convertir tasa anual a mensual
    const monthlyInterestRate = annualInterestRate / 12;

    // 🔹 Número total de pagos (meses)
    const totalPayments = Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyInterestRate)) /
                          Math.log(1 + monthlyInterestRate);

    // 🔹 Total de intereses pagados
    const totalInterestPaid = (monthlyPayment * Math.ceil(totalPayments)) - loanAmount;

    // Crear objeto
    const newDebt = new DebtCalculation({
      userId,
      loanAmount,
      annualInterestRate,
      monthlyPayment,
      totalPayments: Math.ceil(totalPayments),
      totalInterestPaid: totalInterestPaid.toFixed(2),
      saved,
    });

    // ✅ Solo guardar si el usuario está autenticado y quiere guardar
    if (saved && userId) {
      await newDebt.save();
    }

    // 🔄 Formato COP
    const formatCOP = (value) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2,
      }).format(value);

    // 📤 Respuesta
    res.status(201).json({
      message: saved ? "Cálculo de deuda guardado con éxito" : "Cálculo de deuda realizado",
      deuda: {
        _id: newDebt._id,
        loanAmount: formatCOP(loanAmount),
        annualInterestRate: `${(annualInterestRate * 100).toFixed(2)}%`,
        monthlyPayment: formatCOP(monthlyPayment),
        totalPayments: Math.ceil(totalPayments),
        totalInterestPaid: formatCOP(totalInterestPaid),
        createdAt: newDebt.createdAt,
      },
    });
  } catch (error) {
    console.error("🔥 Error en createDebt:", error);
    res.status(500).json({
      message: "Error al calcular la deuda",
      error: error.message,
    });
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
