const express = require("express");

const {
  saveRecipe,
  getSavedRecipes,
  removeSavedRecipe,
  checkSavedRecipe,
  rateRecipe,
  getTopRated,
} = require("../controllers/savedRecipeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/top-rated", getTopRated);

router.use(protect);

router.get("/", getSavedRecipes);
router.post("/", saveRecipe);
router.post("/check", checkSavedRecipe);
router.delete("/:id", removeSavedRecipe);
router.patch("/:id/rating", rateRecipe);

module.exports = router;
