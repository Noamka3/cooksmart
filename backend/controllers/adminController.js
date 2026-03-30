const User = require("../models/User");
const PantryItem = require("../models/PantryItem");
const { SavedRecipe } = require("../models/SavedRecipe");
const Comment = require("../models/Comment");

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPantryItems, totalSavedRecipes, totalComments,
      avgRatingResult, topRatedRecipes, mostActiveUsers, mostCommented] = await Promise.all([
      User.countDocuments(),
      PantryItem.countDocuments(),
      SavedRecipe.countDocuments(),
      Comment.countDocuments(),

      // avg rating across all rated recipes
      SavedRecipe.aggregate([
        { $match: { rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),

      // top 5 rated recipes
      SavedRecipe.aggregate([
        { $match: { rating: { $ne: null } } },
        { $group: {
          _id: "$recipeSignature",
          title: { $first: "$title" },
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        }},
        { $sort: { avgRating: -1, ratingCount: -1 } },
        { $limit: 5 },
      ]),

      // top 5 most active users by saved recipes
      SavedRecipe.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { name: "$user.name", email: "$user.email", count: 1 } },
      ]),

      // top 5 most commented recipes
      Comment.aggregate([
        { $group: { _id: "$recipeSignature", commentCount: { $sum: 1 } } },
        { $sort: { commentCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: "savedrecipes", localField: "_id", foreignField: "recipeSignature", as: "recipe" } },
        { $unwind: { path: "$recipe", preserveNullAndEmptyArrays: true } },
        { $group: { _id: "$_id", commentCount: { $first: "$commentCount" }, title: { $first: "$recipe.title" } } },
        { $sort: { commentCount: -1 } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalPantryItems,
      totalSavedRecipes,
      totalComments,
      avgRating: avgRatingResult[0]?.avg ?? null,
      ratedRecipesCount: avgRatingResult[0]?.count ?? 0,
      topRatedRecipes,
      mostActiveUsers,
      mostCommented,
    });
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

const getUserPantry = async (req, res, next) => {
  try {
    const items = await PantryItem.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUserRole, deleteUser, getUserSavedRecipes, getUserPantry };
