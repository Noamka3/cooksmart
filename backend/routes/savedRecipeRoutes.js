const express = require("express");

const {
  saveRecipe,
  getSavedRecipes,
  removeSavedRecipe,
  checkSavedRecipe,
} = require("../controllers/savedRecipeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getSavedRecipes);
router.post("/", saveRecipe);
router.post("/check", checkSavedRecipe);
router.delete("/:id", removeSavedRecipe);

module.exports = router;
