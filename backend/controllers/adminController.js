const User = require("../models/User");
const PantryItem = require("../models/PantryItem");
const { SavedRecipe } = require("../models/SavedRecipe");

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPantryItems, totalSavedRecipes] = await Promise.all([
      User.countDocuments(),
      PantryItem.countDocuments(),
      SavedRecipe.countDocuments(),
    ]);

    res.json({ totalUsers, totalPantryItems, totalSavedRecipes });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password" },
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Promise.all([
      PantryItem.deleteMany({ userId: req.params.id }),
      SavedRecipe.deleteMany({ userId: req.params.id }),
    ]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getUserSavedRecipes = async (req, res, next) => {
  try {
    const recipes = await SavedRecipe.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUserRole, deleteUser, getUserSavedRecipes };
