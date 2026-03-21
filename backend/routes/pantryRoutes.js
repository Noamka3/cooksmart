const express = require("express");
const { getPantry, addItem, updateItem, deleteItem } = require("../controllers/pantryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getPantry);
router.post("/", addItem);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;