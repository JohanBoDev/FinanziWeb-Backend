const SavingsGoal = require("../models/SavingsGoal");

// Crear una meta de ahorro
exports.createSavingsGoal = async (req, res) => {
  try {
    const { goalName, goalAmount, deadline } = req.body;
    const userId = req.user.userId;

    const newGoal = new SavingsGoal({ userId, goalName, goalAmount, deadline });
    await newGoal.save();

    res.status(201).json({ message: "Meta de ahorro creada exitosamente", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la meta de ahorro", error });
  }
};

// Obtener todas las metas del usuario
exports.getSavingsGoals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goals = await SavingsGoal.find({ userId });

    const updatedGoals = goals.map(goal => {
      let message = `Te falta ${goal.goalAmount - goal.currentAmount} para alcanzar tu meta '${goal.goalName}', y tienes fecha hasta ${goal.deadline.toDateString()}.`;
      
      if (goal.currentAmount >= goal.goalAmount) {
        message = `¡Felicidades! Has alcanzado tu meta de ahorro '${goal.goalName}'.`;
      }
      
      return { ...goal.toObject(), message };
    });

    res.status(200).json(updatedGoals);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las metas de ahorro", error });
  }
};

// Actualizar progreso de la meta
exports.updateSavingsGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { currentAmount } = req.body;
    const userId = req.user.userId;

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: goalId, userId },
      { $set: { currentAmount } },
      { new: true }
    );

    if (!goal) return res.status(404).json({ message: "Meta no encontrada" });

    // Verificar si se alcanzó la meta y enviar una alerta
    let alertMessage = null;
    if (goal.currentAmount >= goal.goalAmount) {
      alertMessage = `¡Felicidades! Alcanzaste tu meta de ahorro '${goal.goalName}'.`;
    } else if (goal.currentAmount >= goal.goalAmount * 0.9) {
      alertMessage = `Estás muy cerca de alcanzar tu meta '${goal.goalName}', sigue así!`;
    }

    res.status(200).json({ goal, alert: alertMessage });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la meta de ahorro", error });
  }
};

// Eliminar una meta de ahorro
exports.deleteSavingsGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user.userId;

    const deletedGoal = await SavingsGoal.findOneAndDelete({ _id: goalId, userId });
    if (!deletedGoal) return res.status(404).json({ message: "Meta no encontrada" });

    res.status(200).json({ message: "Meta de ahorro eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la meta de ahorro", error });
  }
};

