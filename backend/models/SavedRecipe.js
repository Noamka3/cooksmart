const crypto = require("crypto");
const mongoose = require("mongoose");

const normalizeRecipeSignature = ({ title, ingredients, instructions }) => {
  const normalizedTitle = typeof title === "string" ? title.trim().toLowerCase() : "";
  const normalizedIngredients = Array.isArray(ingredients)
    ? ingredients
        .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
        .filter(Boolean)
        .join("|")
    : "";
  const normalizedInstructions =
    typeof instructions === "string" ? instructions.trim().toLowerCase() : "";

  return crypto
    .createHash("sha256")
    .update(`${normalizedTitle}::${normalizedIngredients}::${normalizedInstructions}`)
    .digest("hex");
};

const savedRecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeSignature: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
    bonusRecipes: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          missingIngredients: { type: [String], default: [] },
          content: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

savedRecipeSchema.index({ userId: 1, recipeSignature: 1 }, { unique: true });

module.exports = {
  SavedRecipe: mongoose.model("SavedRecipe", savedRecipeSchema),
  normalizeRecipeSignature,
};
