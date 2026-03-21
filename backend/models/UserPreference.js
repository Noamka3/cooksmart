const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    likedCuisines: {
      type: [String],
      default: [],
    },
    dietaryRestrictions: {
      type: [String],
      default: [],
    },
    dislikedIngredients: {
      type: [String],
      default: [],
    },
    preferredCookingTime: {
      type: String,
      enum: ["under_30", "under_60", "any"],
      default: "any",
    },
    favoriteFoodTypes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);