const express = require("express");
const { getPreferences, savePreferences } = require("../controllers/preferencesController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getPreferences);
router.put("/", savePreferences);

module.exports = router;