const SavingsCalculation = require("../models/SavingsCalculation");

// 🔹 Función para formatear valores en COP
const formatCOP = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
}).format(value);


// 📌 Crear un nuevo cálculo de ahorros
exports.createSavings = async (req, res) => {
  try {
    const {
      initialAmount,
      monthlyContribution,
      interestRate, // opcional
      compoundFrequency, // veces al año
      timeInYears,
      saved = false, // por defecto false si no viene
    } = req.body;

    // 🔍 Verificar token solo si se quiere guardar
    let userId = null;
    const token = req.headers.authorization?.replace("Bearer ", "");

    console.log("🔐 Token recibido:", token); // <--- Log 1

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token decodificado:", decoded); // <--- Log 2

        userId = decoded.userId;
        req.user = decoded;
      } catch (err) {
        console.error("❌ Error al verificar el token:", err.message); // <--- Log 3

        if (saved === true) {
          return res.status(401).json({
            message: "Para guardar el cálculo debes iniciar sesión.",
          });
        }
      }
    } else {
      console.warn("⚠️ No se recibió token."); // <--- Log 4
    }


    // ✅ Validaciones básicas
    if (
      initialAmount === undefined ||
      monthlyContribution === undefined ||
      !compoundFrequency ||
      !timeInYears
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios excepto la tasa de interés",
      });
    }

    // Conversión segura
    const P = Number(initialAmount);
    const M = Number(monthlyContribution);
    const r = Number(interestRate);
    const n = Number(compoundFrequency);
    const t = Number(timeInYears);

    const totalMeses = t * 12;
    let saldo = P;
    const mesesPorCapitalizacion = Math.floor(12 / n);

    // 🔁 Simulación mes a mes
    for (let mes = 1; mes <= totalMeses; mes++) {
      saldo += M;
      if (mes % mesesPorCapitalizacion === 0 && r > 0) {
        const tasaPeriodo = r / n;
        saldo *= 1 + tasaPeriodo;
      }
    }

    const totalAportado = P + M * totalMeses;
    const interestEarned = saldo - totalAportado;

    const newSavings = new SavingsCalculation({
      userId,
      initialAmount: P,
      monthlyContribution: M,
      interestRate: r || 0,
      compoundFrequency: n,
      timeInYears: t,
      finalAmount: saldo.toFixed(2),
      interestEarned: interestEarned.toFixed(2),
      saved,
    });

    // Solo guardar en DB si lo solicita y está autenticado
    if (saved && userId) {
      await newSavings.save();
    }

    // 🔄 Formato COP
    const formatCOP = (value) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2,
      }).format(value);

    res.status(201).json({
      message: saved ? "Cálculo de ahorro guardado con éxito" : "Cálculo de ahorro realizado",
      ahorro: {
        _id: newSavings._id,
        initialAmount: formatCOP(P),
        monthlyContribution: formatCOP(M),
        interestRate: r ? `${(r * 100).toFixed(2)}%` : "Sin interés",
        compoundFrequency: n,
        timeInYears: t,
        finalAmount: formatCOP(saldo),
        interestEarned: formatCOP(interestEarned),
        createdAt: newSavings.createdAt,
      },
    });
  } catch (error) {
    console.error("🔥 Error en createSavings:", error);
    res.status(500).json({
      message: "Error al calcular el ahorro",
      error: error.message,
    });
  }
};


// 📌 Obtener todos los cálculos de ahorro
exports.getAllSavings = async (req, res) => {
  try {
    const savings = await SavingsCalculation.find({ userId: req.user.userId });

    // 🔹 Transformar los valores a COP antes de enviarlos en la respuesta
    const formattedSavings = savings.map(saving => ({
      _id: saving._id,
      initialAmount: formatCOP(saving.initialAmount),
      monthlyContribution: formatCOP(saving.monthlyContribution),
      interestRate: saving.interestRate ? `${(saving.interestRate * 100).toFixed(2)}%` : "Sin interés",
      compoundFrequency: saving.compoundFrequency,
      timeInYears: saving.timeInYears,
      finalAmount: formatCOP(saving.finalAmount),
      interestEarned: formatCOP(saving.interestEarned),
      saved: saving.saved,
      createdAt: saving.createdAt,
      updatedAt: saving.updatedAt
    }));

    res.status(200).json({
      message: "Lista de cálculos de ahorro obtenida con éxito",
      ahorros: formattedSavings,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los cálculos de ahorro",
      error: error.message,
    });
  }
};

// 📌 Obtener un cálculo de ahorro por ID
exports.getSavingsById = async (req, res) => {
  try {
    const saving = await SavingsCalculation.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ message: "Cálculo de ahorro no encontrado" });
    }

    // 🔹 Transformar los valores a COP antes de enviarlos en la respuesta
    const formattedSaving = {
      _id: saving._id,
      initialAmount: formatCOP(saving.initialAmount),
      monthlyContribution: formatCOP(saving.monthlyContribution),
      interestRate: saving.interestRate ? `${(saving.interestRate * 100).toFixed(2)}%` : "Sin interés",
      compoundFrequency: saving.compoundFrequency,
      timeInYears: saving.timeInYears,
      finalAmount: formatCOP(saving.finalAmount),
      interestEarned: formatCOP(saving.interestEarned),
      saved: saving.saved,
      createdAt: saving.createdAt,
      updatedAt: saving.updatedAt
    };

    res.status(200).json({
      message: "Cálculo de ahorro encontrado",
      ahorro: formattedSaving,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el cálculo de ahorro",
      error: error.message,
    });
  }
};

// Actualizar un cálculo de ahorro
exports.updateSavings = async (req, res) => {
  try {
    // 🔹 Buscar el ahorro en la base de datos antes de actualizar
    const existingSavings = await SavingsCalculation.findById(req.params.id);

    if (!existingSavings) {
      return res.status(404).json({ message: "Cálculo de ahorro no encontrado" });
    }

    // 🔹 Obtener los nuevos valores (si se enviaron en el body)
    const initialAmount = req.body.initialAmount ?? existingSavings.initialAmount;
    const monthlyContribution = req.body.monthlyContribution ?? existingSavings.monthlyContribution;
    const interestRate = req.body.interestRate ?? existingSavings.interestRate;
    const compoundFrequency = req.body.compoundFrequency ?? existingSavings.compoundFrequency;
    const timeInYears = req.body.timeInYears ?? existingSavings.timeInYears;

    let finalAmount = initialAmount;
    let interestEarned = 0;

    if (interestRate && interestRate > 0) {
      // 🔹 Cálculo con interés compuesto
      const n = compoundFrequency;
      const r = interestRate;
      const P = initialAmount;
      const t = timeInYears;

      finalAmount = P * Math.pow(1 + r / n, n * t) +
        monthlyContribution * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));

      interestEarned = finalAmount - (P + monthlyContribution * t * 12);
    } else {
      // 🔹 Cálculo sin intereses
      finalAmount = initialAmount + (monthlyContribution * timeInYears * 12);
      interestEarned = 0;
    }

    // 🔹 Formatear valores en COP
    const formatCOP = (value) => new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

    // 🔹 Actualizar los valores en la base de datos
    const updatedSavings = await SavingsCalculation.findByIdAndUpdate(
      req.params.id,
      {
        initialAmount,
        monthlyContribution,
        interestRate,
        compoundFrequency,
        timeInYears,
        finalAmount: finalAmount.toFixed(2),
        interestEarned: interestEarned.toFixed(2),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Cálculo de ahorro actualizado correctamente",
      ahorro: {
        _id: updatedSavings._id,
        initialAmount: formatCOP(updatedSavings.initialAmount),
        monthlyContribution: formatCOP(updatedSavings.monthlyContribution),
        interestRate: interestRate ? `${(updatedSavings.interestRate * 100).toFixed(2)}%` : "Sin interés",
        compoundFrequency: updatedSavings.compoundFrequency,
        timeInYears: updatedSavings.timeInYears,
        finalAmount: formatCOP(updatedSavings.finalAmount),
        interestEarned: formatCOP(updatedSavings.interestEarned),
        updatedAt: updatedSavings.updatedAt
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el cálculo de ahorro",
      error: error.message,
    });
  }
};

// Eliminar un cálculo de ahorro
exports.deleteSavings = async (req, res) => {
  try {
    const savings = await SavingsCalculation.findByIdAndDelete(req.params.id);
    if (!savings) {
      return res
        .status(404)
        .json({ message: "Cálculo de ahorro no encontrado" });
    }
    res
      .status(200)
      .json({ message: "Cálculo de ahorro eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar el cálculo de ahorro",
        error: error.message,
      });
  }
};
