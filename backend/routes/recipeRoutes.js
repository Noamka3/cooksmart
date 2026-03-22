const express = require("express");

const { generateRecipe } = require("../controllers/recipeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/generate", generateRecipe);

module.exports = router;
