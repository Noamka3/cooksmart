const PantryItem = require("../models/PantryItem");
const UserPreference = require("../models/UserPreference");
const { generateRecipeFromProfile } = require("../utils/geminiRecipeService");

const generateRecipe = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [preferences, pantryItems] = await Promise.all([
      UserPreference.findOne({ userId }).lean(),
      PantryItem.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (pantryItems.length === 0) {
      return res.json({
        recipe: {
          title: "המזווה שלך ריק",
          ingredients: [],
          content: "עדיין לא הוספת מוצרים למזווה. הוסף כמה מרכיבים ואעזור לך להכין מהם ארוחה טעימה!",
        },
      });
    }

    const recipe = await generateRecipeFromProfile({
      user: {
        id: String(req.user._id),
        name: req.user.name,
      },
      preferences: preferences
        ? {
            likedCuisines: preferences.likedCuisines || [],
            dietaryRestrictions: preferences.dietaryRestrictions || [],
            dislikedIngredients: preferences.dislikedIngredients || [],
            preferredCookingTime: preferences.preferredCookingTime || "any",
            favoriteFoodTypes: preferences.favoriteFoodTypes || [],
          }
        : null,
      pantryItems: pantryItems.map((item) => ({
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
      })),
    });

    return res.json({ recipe });
  } catch (error) {
    return next(error);
  }
};

module.exports = { generateRecipe };
