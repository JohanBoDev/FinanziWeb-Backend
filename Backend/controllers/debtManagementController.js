const Debt = require("../models/Debt");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// 📌 Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASS  // Tu contraseña
  }
});

// 📌 Función para enviar recordatorios de pagos
const sendPaymentReminders = async () => {
  try {
    const today = new Date();
    const upcomingDueDate = new Date();
    upcomingDueDate.setDate(today.getDate() + 3); // 3 días antes del vencimiento

    const debts = await Debt.find({
      dueDate: { $lte: upcomingDueDate }, // Filtra deudas con vencimiento en 3 días o menos
      remainingBalance: { $gt: 0 }, // Solo deudas pendientes
    }).populate("userId", "email name");

    debts.forEach(async (debt) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: debt.userId.email,
        subject: "🔔 Recordatorio de Pago Pendiente",
        text: `Hola ${debt.userId.name}, tu pago de ${debt.monthlyPayment.toLocaleString("es-CO", { style: "currency", currency: "COP" })} vence el ${new Date(debt.dueDate).toLocaleDateString("es-CO")}. Evita recargos pagando a tiempo.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📩 Recordatorio enviado a ${debt.userId.email}`);
    });

  } catch (error) {
    console.error("❌ Error en sendPaymentReminders:", error.message);
  }
};

// 📌 Programar la tarea diaria a las 8:00 AM
cron.schedule("0 8 * * *", sendPaymentReminders);


// 📌 Registrar un nuevo préstamo (Deuda)
exports.createDebt = async (req, res) => {
    try {
      const { loanAmount, annualInterestRate, monthlyPayment, totalPayments, dueDate, strategy } = req.body;
  
      // Crear nueva deuda
      const newDebt = new Debt({
        userId: req.user.userId,
        loanAmount,
        annualInterestRate,
        monthlyPayment,
        totalPayments,
        dueDate,
        remainingBalance: loanAmount,
        strategy
      });
  
      await newDebt.save();
  
      // Respuesta detallada para el usuario
      res.status(201).json({
        message: "✅ La deuda ha sido registrada con éxito.",
        detalle: {
          aviso: "Recuerda que el pago puntual evitará intereses adicionales.",
          instrucciones: "Puedes realizar pagos parciales en cualquier momento y monitorear tu saldo restante.",
          proxima_accion: `Tu primer pago está programado para el ${new Date(dueDate).toLocaleDateString("es-CO")}.`,
        },
        deuda: newDebt
      });
  
    } catch (error) {
      res.status(500).json({ 
        error: "⚠️ Ocurrió un problema al registrar la deuda.",
        detalle: "Verifica que todos los datos sean correctos e intenta nuevamente.",
        mensaje_tecnico: error.message
      });
    }
  };
  

// 📌 Obtener todas las deudas del usuario
exports.getDebts = async (req, res) => {
    try {
      const debts = await Debt.find({ userId: req.user.userId });
  
      if (debts.length === 0) {
        return res.status(200).json({
          message: "ℹ️ No tienes deudas registradas.",
          sugerencia: "Puedes agregar una nueva deuda para hacer un seguimiento de tus pagos.",
          deudas: []
        });
      }
  
      res.status(200).json({
        message: "✅ Deudas obtenidas con éxito.",
        aviso: "Recuerda revisar las fechas de vencimiento para evitar cargos adicionales.",
        totalDeudas: debts.length,
        deudas: debts
      });
  
    } catch (error) {
      res.status(500).json({ 
        error: "⚠️ Ocurrió un problema al obtener las deudas.",
        detalle: "Intenta nuevamente más tarde. Si el problema persiste, contacta con soporte.",
        mensaje_tecnico: error.message
      });
    }
  };
  

// 📌 Registrar un pago parcial
exports.payDebt = async (req, res) => {
    try {
      const { amount } = req.body;
      const debt = await Debt.findById(req.params.id);
  
      if (!debt) {
        return res.status(404).json({ 
          error: "⚠️ Deuda no encontrada.",
          sugerencia: "Verifica que el ID de la deuda sea correcto e intenta nuevamente."
        });
      }
  
      if (amount <= 0) {
        return res.status(400).json({
          error: "⚠️ El monto del pago debe ser mayor a cero.",
          sugerencia: "Introduce un valor válido para registrar el pago."
        });
      }
  
      if (amount > debt.remainingBalance) {
        return res.status(400).json({
          error: "⚠️ El monto ingresado excede el saldo pendiente.",
          sugerencia: `Tu saldo actual es de ${debt.remainingBalance.toLocaleString("es-CO", { style: "currency", currency: "COP" })}. Ingresa un monto menor o igual a esta cantidad.`
        });
      }
  
      // Actualizar el saldo y el total pagado
      debt.paidAmount += amount;
      debt.remainingBalance -= amount;
  
      // Si la deuda se paga completamente, actualizar el estado
      if (debt.remainingBalance <= 0) {
        debt.remainingBalance = 0;
        debt.status = "completada";
      }
  
      await debt.save();
  
      res.status(200).json({
        message: "✅ Pago registrado con éxito.",
        detalle: `Has abonado ${amount.toLocaleString("es-CO", { style: "currency", currency: "COP" })} a tu deuda.`,
        estado_actualizado: {
          saldo_pendiente: debt.remainingBalance.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
          total_pagado: debt.paidAmount.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
          estado: debt.status
        }
      });
  
    } catch (error) {
      res.status(500).json({ 
        error: "⚠️ Error al registrar el pago.",
        detalle: "Verifica los datos e intenta nuevamente. Si el problema persiste, contacta con soporte.",
        mensaje_tecnico: error.message
      });
    }
  };
  
// 📌 Eliminar deuda
exports.deleteDebt = async (req, res) => {
  try {
    await Debt.findByIdAndDelete(req.params.id);
    res.json({ message: "Deuda eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la deuda" });
  }
};

// 📌 Cálculo de estrategia de pago de deudas
exports.calculateDebtStrategy = async (req, res) => {
    try {
      const debts = await Debt.find({ userId: req.user.userId, remainingBalance: { $gt: 0 } });
  
      if (debts.length === 0) {
        return res.status(200).json({
          message: "ℹ️ No tienes deudas activas para analizar.",
        });
      }
  
      // 📌 Método Avalancha: Ordena por tasa de interés de mayor a menor
      const avalancha = [...debts].sort((a, b) => b.annualInterestRate - a.annualInterestRate);
  
      // 📌 Método Bola de Nieve: Ordena por saldo pendiente de menor a mayor
      const bolaDeNieve = [...debts].sort((a, b) => a.remainingBalance - b.remainingBalance);
  
      res.status(200).json({
        message: "✅ Estrategias de pago calculadas con éxito.",
        estrategia_avalancha: {
          descripcion: "Pagar primero la deuda con mayor tasa de interés para reducir intereses totales.",
          orden: avalancha.map(d => ({
            id: d._id,
            monto_pendiente: d.remainingBalance,
            tasa_interes: `${(d.annualInterestRate * 100).toFixed(2)}%`
          }))
        },
        estrategia_bola_nieve: {
          descripcion: "Pagar primero la deuda más pequeña para liberar compromisos rápidamente.",
          orden: bolaDeNieve.map(d => ({
            id: d._id,
            monto_pendiente: d.remainingBalance,
            tasa_interes: `${(d.annualInterestRate * 100).toFixed(2)}%`
          }))
        }
      });
  
    } catch (error) {
      res.status(500).json({
        error: "⚠️ Ocurrió un problema al calcular las estrategias de pago.",
        detalle: error.message
      });
    }
  };

// 📌 Simulador de pago de deudas
exports.simulateDebtPayments = async (req, res) => {
    try {
      const { extraPayment } = req.body;

      // Validar que extraPayment sea un número válido y positivo
      if (!extraPayment || isNaN(extraPayment) || extraPayment <= 0) {
        return res.status(400).json({
          error: "⚠️ El monto adicional debe ser un número mayor a 0.",
          sugerencia: "Ingresa un valor válido para la simulación."
        });
      }

      const debts = await Debt.find({ userId: req.user.userId, remainingBalance: { $gt: 0 } });

      if (debts.length === 0) {
        return res.status(200).json({
          message: "ℹ️ No tienes deudas activas para simular pagos.",
        });
      }

      const simulation = debts.map(debt => {
        let remainingBalance = parseFloat(debt.remainingBalance);
        let monthlyPayment = parseFloat(debt.monthlyPayment) + parseFloat(extraPayment);
        let months = 0;
        let totalPaid = 0;

        // Validar que el pago mensual no sea mayor al saldo restante
        if (monthlyPayment > remainingBalance) {
          monthlyPayment = remainingBalance;
        }

        while (remainingBalance > 0) {
          const interest = (remainingBalance * parseFloat(debt.annualInterestRate)) / 12;
          remainingBalance = remainingBalance + interest - monthlyPayment;
          totalPaid += monthlyPayment;
          months++;

          if (months > 600) break; // Evitar bucles infinitos
        }

        return {
          id: debt._id,
          pago_mensual_con_extra: monthlyPayment.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
          meses_necesarios: months,
          total_pagado: totalPaid.toLocaleString("es-CO", { style: "currency", currency: "COP" })
        };
      });

      res.status(200).json({
        message: "✅ Simulación de pagos completada.",
        simulaciones: simulation
      });

    } catch (error) {
      res.status(500).json({
        error: "⚠️ Error en la simulación de pagos.",
        detalle: error.message
      });
    }
};

