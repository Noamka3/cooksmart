const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getStats, getUsers, updateUserRole, deleteUser, getUserSavedRecipes } = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/saved-recipes", getUserSavedRecipes);

module.exports = router;
