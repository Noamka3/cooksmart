const PantryItem = require("../models/PantryItem");
const { identifyIngredientFromImage } = require("../utils/geminiImageService");
const { uploadImage } = require("../utils/cloudinaryService");

const getPantry = async (req, res, next) => {
  try {
    const items = await PantryItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { ingredientName, quantity, unit, expiryDate } = req.body;

    if (!ingredientName) {
      return res.status(400).json({ message: "Ingredient name is required" });
    }

    const item = await PantryItem.create({
      userId: req.user._id,
      ingredientName,
      quantity: quantity || null,
      unit: unit || null,
      expiryDate: expiryDate || null,
    });

    return res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { ingredientName, quantity, unit, expiryDate } = req.body;

    item.ingredientName = ingredientName ?? item.ingredientName;
    item.quantity = quantity ?? item.quantity;
    item.unit = unit ?? item.unit;
    item.expiryDate = expiryDate ?? item.expiryDate;

    await item.save();

    return res.json({ item });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({ message: "Item removed" });
  } catch (error) {
    next(error);
  }
};

const identifyImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "image file is required" });
    }

    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const base64Image = buffer.toString("base64");

    const [geminiResult, imageUrl] = await Promise.all([
      identifyIngredientFromImage(base64Image, mimeType),
      uploadImage(buffer, mimeType),
    ]);

    return res.json({ ...geminiResult, imageUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPantry, addItem, updateItem, deleteItem, identifyImage };