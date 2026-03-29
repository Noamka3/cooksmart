const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { getPantry, addItem, updateItem, deleteItem, identifyImage } = require("../controllers/pantryController");
const { protect } = require("../middleware/authMiddleware");

const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "יותר מדי בקשות זיהוי תמונה, נסה שוב עוד דקה" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("רק קבצי תמונה מותרים"));
  },
});

router.use(protect);

router.get("/", getPantry);
router.post("/", upload.single("image"), addItem);
router.post("/identify-image", imageLimiter, upload.single("image"), identifyImage);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;