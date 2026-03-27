const mongoose = require("mongoose");

const pantryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      default: null,
    },
    unit: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PantryItem", pantryItemSchema);