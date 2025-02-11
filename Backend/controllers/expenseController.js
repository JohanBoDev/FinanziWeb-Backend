const Expense = require("../models/Expense");
const fs = require("fs");
const csvParser = require("csv-parser");
const mongoose = require("mongoose");




// Generar reporte semanal o mensual

exports.getExpenseReport = async (req, res) => {
  try {
    const { type } = req.query; // Puede ser "weekly" o "monthly"
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convertir a ObjectId

    if (!type || (type !== "weekly" && type !== "monthly")) {
      return res.status(400).json({ message: "Debes especificar 'type=weekly' o 'type=monthly'" });
    }

    let groupFormat;
    if (type === "weekly") {
      groupFormat = {
        year: { $year: "$date" },
        week: { $isoWeek: "$date" } // Usar $isoWeek para semanas ISO
      };
    } else {
      groupFormat = {
        year: { $year: "$date" },
        month: { $month: "$date" }
      };
    }

    // Agregación en MongoDB para agrupar los gastos
    const report = await Expense.aggregate([
      { $match: { userId } }, // Filtrar por usuario
      { $group: { _id: groupFormat, totalSpent: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
    ]);

    // Convertir los datos en un formato más fácil de entender
    const formattedReport = report.map(entry => ({
      period: type === "weekly" 
        ? `Semana ${entry._id.week} de ${entry._id.year}` 
        : `Mes ${entry._id.month} de ${entry._id.year}`,
      totalSpent: entry.totalSpent
    }));

    res.status(200).json({
      message: `Reporte ${type === "weekly" ? "semanal" : "mensual"} generado`,
      report: formattedReport.length > 0 ? formattedReport : "No hay datos para este período"
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar el reporte", error });
  }
};


// Importar gastos desde CSV
exports.importExpensesFromCSV = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Por favor, sube un archivo CSV." });
      }
  
      const expenses = [];
      const userId = req.user.userId; // Extraer el userId del token
  
      // Leer el archivo CSV
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          if (row.amount && row.category && row.date && row.paymentMethod) {
            expenses.push({
              userId,
              amount: parseFloat(row.amount),
              category: row.category,
              date: new Date(row.date),
              paymentMethod: row.paymentMethod,
              notes: row.notes || "",
            });
          }
        })
        .on("end", async () => {
          if (expenses.length === 0) {
            return res.status(400).json({ message: "El archivo CSV no tiene datos válidos." });
          }
  
          await Expense.insertMany(expenses);
          res.status(201).json({ message: "Gastos importados exitosamente.", imported: expenses.length });
        })
        .on("error", (error) => {
          res.status(500).json({ message: "Error al procesar el archivo CSV.", error });
        });
  
    } catch (error) {
      res.status(500).json({ message: "Error al importar gastos desde CSV.", error });
    }
  };

// Obtener todos los gastos del usuario con filtros opcionales
exports.getExpenses = async (req, res) => {
    try {
      const { startDate, endDate, category, paymentMethod } = req.query;
      const userId = req.user.userId;
  
      // Construcción dinámica del filtro
      let filter = { userId };
  
      if (startDate && endDate) {
        filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      } else if (startDate) {
        filter.date = { $gte: new Date(startDate) };
      } else if (endDate) {
        filter.date = { $lte: new Date(endDate) };
      }
  
      if (category) {
        filter.category = category;
      }
  
      if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
      }
  
      const expenses = await Expense.find(filter).sort({ date: -1 });
    if (expenses.length === 0) {
        return res.status(404).json({ message: "No se encontraron gastos" });
        }
      res.status(200).json({ message: "Gastos encontrados", expenses });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los gastos", error });
    }
  };
  
  
// Obtener un gasto por ID 
exports.getExpenseById = async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id);
  
      // Verificar si el gasto existe
      if (!expense) return res.status(404).json({ message: "Gasto no encontrado" });
  
      // Verificar si el gasto pertenece al usuario autenticado
      if (expense.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "No tienes permiso para ver este gasto" });
      }
  
      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el gasto", error });
    }
  };
  
  
  // Crear un nuevo gasto
  exports.createExpense = async (req, res) => {
    try {
      const { amount, category, date, paymentMethod, notes } = req.body;
      const userId = req.user.userId;
  
      const newExpense = new Expense({
        userId,
        amount,
        category,
        date,
        paymentMethod,
        notes,
      });
  
      await newExpense.save();
  
      res.status(201).json({ message: "Gasto registrado con éxito", expense: newExpense });
    } catch (error) {
      res.status(500).json({ message: "Error al registrar el gasto", error });
    }
  };
  
// Actualizar un gasto (Solo si pertenece al usuario autenticado)
exports.updateExpense = async (req, res) => {
    try {
      // Buscar el gasto por ID
      const expense = await Expense.findById(req.params.id);
      
      if (!expense) return res.status(404).json({ message: "Gasto no encontrado" });
  
      // Verificar si el usuario autenticado es el dueño del gasto
      if (expense.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "No tienes permiso para actualizar este gasto" });
      }
  
      // Actualizar solo los campos enviados en req.body
      Object.keys(req.body).forEach((key) => {
        expense[key] = req.body[key];
      });
  
      // Guardar los cambios
      await expense.save();
  
      res.status(200).json({ message: "Gasto actualizado", expense });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el gasto", error });
    }
  };
  
  
  // Eliminar un gasto
  exports.deleteExpense = async (req, res) => {
    try {
      const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
  
      if (!deletedExpense) return res.status(404).json({ message: "Gasto no encontrado" });

      if (deletedExpense.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "No tienes permiso para eliminar este gasto" });
      }
  
      res.status(200).json({ message: "Gasto eliminado", expense: deletedExpense });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el gasto", error });
    }
  };