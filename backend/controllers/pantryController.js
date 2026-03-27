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
    const { ingredientName, quantity, unit, expiryDate, imageUrl } = req.body;

    if (!ingredientName || !ingredientName.trim()) {
      return res.status(400).json({ message: "Ingredient name is required" });
    }

    const normalizedName = ingredientName.trim();

    const existing = await PantryItem.findOne({
      userId: req.user._id,
      ingredientName: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existing) {
      const existingQty = parseFloat(existing.quantity);
      const newQty = parseFloat(quantity);
      const sameUnit = (existing.unit || null) === (unit || null);

      if (sameUnit && !isNaN(existingQty) && !isNaN(newQty)) {
        existing.quantity = String(Math.round((existingQty + newQty) * 1000) / 1000);
      } else if (quantity) {
        existing.quantity = String(quantity);
      }

      if (unit) existing.unit = unit;
      if (expiryDate) existing.expiryDate = expiryDate;
      if (imageUrl) existing.imageUrl = imageUrl;

      await existing.save();
      return res.status(200).json({ item: existing, merged: true });
    }

    const item = await PantryItem.create({
      userId: req.user._id,
      ingredientName: normalizedName,
      quantity: quantity || null,
      unit: unit || null,
      expiryDate: expiryDate || null,
      imageUrl: imageUrl || null,
    });

    return res.status(201).json({ item, merged: false });
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

    const { ingredientName, quantity, unit, expiryDate, imageUrl } = req.body;

    if (typeof ingredientName === "string") {
      item.ingredientName = ingredientName.trim() || item.ingredientName;
    }
    item.quantity = quantity ?? item.quantity;
    item.unit = unit ?? item.unit;
    item.expiryDate = expiryDate ?? item.expiryDate;
    item.imageUrl = imageUrl ?? item.imageUrl;

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
