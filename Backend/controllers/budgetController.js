const Budget = require("../models/Budget");

// Crear un nuevo presupuesto
exports.createBudget = async (req, res) => {
    try {
      const { month, income, categoryAllocations } = req.body;
      
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
  
      const userId = req.user.userId;
  
      // Validar que la suma de allocatedAmount no sea mayor al income
      const totalAllocated = categoryAllocations.reduce((sum, item) => sum + item.allocatedAmount, 0);
      if (totalAllocated > income) {
        return res.status(400).json({ message: "La suma de los presupuestos no puede ser mayor al ingreso" });
      }
  
      const budget = new Budget({ userId, month, income, categoryAllocations });
      await budget.save();
  
      res.status(201).json({
        message: "Presupuesto creado exitosamente",
        budget
      });
    } catch (error) {
      res.status(500).json({ message: "Error al crear el presupuesto", error });
    }
  };
// Obtener todos los presupuestos del usuario
exports.getBudgets = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Usuario no autenticado" });
          }
      
          const userId = req.user.userId;      
      const budgets = await Budget.find({ userId});
      
      console.log("Presupuestos encontrados:", budgets);
      
      res.status(200).json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los presupuestos", error });
    }
  };
  
  // Obtener un presupuesto por ID
  exports.getBudgetById = async (req, res) => {
    try {
      const { budgetId } = req.params;
      const userId = req.user.userId;
  
      const budget = await Budget.findOne({ _id: budgetId, userId });
      if (!budget) return res.status(404).json({ message: "Presupuesto no encontrado" });
  
      res.status(200).json({
        message: "Presupuesto encontrado exitosamente",   
        budget
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el presupuesto", error });
    }
  }

// Actualizar un presupuesto
  exports.updateBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const { category, actualSpent, income, categoryAllocations } = req.body;
        const userId = req.user.userId;

        console.log("Usuario autenticado:", userId);

        let updateFields = {};
        let warnings = [];

        // Si el usuario quiere actualizar solo `actualSpent`
        if (category && actualSpent !== undefined) {
            updateFields["categoryAllocations.$.actualSpent"] = actualSpent;
        }

        // Si el usuario quiere actualizar `income`
        if (income !== undefined) {
            updateFields["income"] = income;
        }

        // Obtener el presupuesto actual para validar datos
        const currentBudget = await Budget.findOne({ _id: budgetId, userId });
        if (!currentBudget) return res.status(404).json({ message: "Presupuesto no encontrado" });

        // Si el usuario quiere actualizar `categoryAllocations`, validar si supera el ingreso
        if (categoryAllocations) {
            const totalAllocated = categoryAllocations.reduce((sum, item) => sum + item.allocatedAmount, 0);
            
            const incomeToValidate = income !== undefined ? income : currentBudget.income;
            if (totalAllocated > incomeToValidate) {
                return res.status(400).json({ message: "La suma de los presupuestos no puede ser mayor al ingreso" });
            }

            updateFields["categoryAllocations"] = categoryAllocations;
        }

        // Verificar si algún `actualSpent` supera `allocatedAmount`
        currentBudget.categoryAllocations.forEach((cat) => {
            const updatedCategory = categoryAllocations?.find(c => c.category === cat.category);
            const spentAmount = updatedCategory?.actualSpent !== undefined ? updatedCategory.actualSpent : cat.actualSpent;
            
            if (spentAmount > cat.allocatedAmount) {
                warnings.push(`El gasto en '${cat.category}' (${spentAmount}) supera el presupuesto asignado (${cat.allocatedAmount}).`);
            }
        });

        const updatedBudget = await Budget.findOneAndUpdate(
            { _id: budgetId, userId },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedBudget) return res.status(404).json({ message: "Presupuesto no encontrado" });

        res.status(200).json({
            message: "Presupuesto actualizado exitosamente",
            budget: updatedBudget,
            warnings: warnings.length > 0 ? warnings : undefined
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el presupuesto", error });
    }
};

  
  

// Eliminar un presupuesto
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { budgetId } = req.params;
    const deletedBudget = await Budget.findOneAndDelete({ _id: budgetId, userId});

    if (!deletedBudget) return res.status(404).json({ message: "Presupuesto no encontrado" });

    res.status(200).json({ message: "Presupuesto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el presupuesto", error });
  }
};
