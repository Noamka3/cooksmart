const express = require("express");
const multer = require("multer");
const { getPantry, addItem, updateItem, deleteItem, identifyImage } = require("../controllers/pantryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get("/", getPantry);
router.post("/", addItem);
router.post("/identify-image", upload.single("image"), identifyImage);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;