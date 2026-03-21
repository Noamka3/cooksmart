const UserPreference = require("../models/UserPreference");

const getPreferences = async (req, res, next) => {
  try {
    const prefs = await UserPreference.findOne({ userId: req.user._id });
    if (!prefs) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    return res.json({ preferences: prefs });
  } catch (error) {
    next(error);
  }
};

const savePreferences = async (req, res, next) => {
  try {
    const {
      likedCuisines,
      dietaryRestrictions,
      dislikedIngredients,
      preferredCookingTime,
      favoriteFoodTypes,
    } = req.body;

    const prefs = await UserPreference.findOneAndUpdate(
      { userId: req.user._id },
      {
        likedCuisines,
        dietaryRestrictions,
        dislikedIngredients,
        preferredCookingTime,
        favoriteFoodTypes,
      },
      { new: true, upsert: true }
    );

    return res.json({ preferences: prefs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPreferences, savePreferences };