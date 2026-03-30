const { SavedRecipe, normalizeRecipeSignature } = require("../models/SavedRecipe");

const normalizeRecipePayload = (payload = {}) => {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const ingredients = Array.isArray(payload.ingredients)
    ? payload.ingredients
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
    : [];
  const instructions =
    typeof payload.instructions === "string"
      ? payload.instructions.trim()
      : typeof payload.content === "string"
        ? payload.content.trim()
        : "";
  const notes = typeof payload.notes === "string" && payload.notes.trim() ? payload.notes.trim() : null;

  return { title, ingredients, instructions, notes };
};

const validateRecipePayload = (recipe) => {
  if (!recipe.title) {
    return "Recipe title is required";
  }

  if (!recipe.instructions) {
    return "Recipe instructions are required";
  }

  return null;
};

const saveRecipe = async (req, res, next) => {
  try {
    const recipe = normalizeRecipePayload(req.body);
    const validationMessage = validateRecipePayload(recipe);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const recipeSignature = normalizeRecipeSignature(recipe);

    const existingRecipe = await SavedRecipe.findOne({
      userId: req.user._id,
      recipeSignature,
    });

    if (existingRecipe) {
      return res.status(200).json({
        message: "Recipe already saved",
        savedRecipe: existingRecipe,
        alreadySaved: true,
      });
    }

    const savedRecipe = await SavedRecipe.create({
      userId: req.user._id,
      recipeSignature,
      ...recipe,
    });

    return res.status(201).json({
      message: "Recipe saved",
      savedRecipe,
      alreadySaved: false,
    });
  } catch (error) {
    next(error);
  }
};

const getSavedRecipes = async (req, res, next) => {
  try {
    const savedRecipes = await SavedRecipe.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ savedRecipes });
  } catch (error) {
    next(error);
  }
};

const removeSavedRecipe = async (req, res, next) => {
  try {
    const savedRecipe = await SavedRecipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedRecipe) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    return res.json({ message: "Saved recipe removed" });
  } catch (error) {
    next(error);
  }
};

const checkSavedRecipe = async (req, res, next) => {
  try {
    const recipe = normalizeRecipePayload(req.body);
    const validationMessage = validateRecipePayload(recipe);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const recipeSignature = normalizeRecipeSignature(recipe);
    const savedRecipe = await SavedRecipe.findOne({
      userId: req.user._id,
      recipeSignature,
    });

    return res.json({
      isSaved: Boolean(savedRecipe),
      savedRecipeId: savedRecipe?._id || null,
    });
  } catch (error) {
    next(error);
  }
};

const rateRecipe = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const savedRecipe = await SavedRecipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { rating: Math.round(rating) },
      { new: true },
    );

    if (!savedRecipe) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    return res.json({ savedRecipe });
  } catch (error) {
    next(error);
  }
};

const getTopRated = async (req, res, next) => {
  try {
    const top = await SavedRecipe.aggregate([
      { $match: { rating: { $ne: null } } },
      {
        $group: {
          _id: "$recipeSignature",
          title: { $first: "$title" },
          ingredients: { $first: "$ingredients" },
          instructions: { $first: "$instructions" },
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, ratingCount: -1 } },
      { $limit: 8 },
    ]);

    return res.json({ topRated: top });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveRecipe,
  getSavedRecipes,
  removeSavedRecipe,
  checkSavedRecipe,
  rateRecipe,
  getTopRated,
};
