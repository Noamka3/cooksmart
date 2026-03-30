const express = require("express");
const { getComments, addComment, toggleLike, toggleDislike } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:signature", getComments);
router.post("/:signature", protect, addComment);
router.patch("/:id/like", protect, toggleLike);
router.patch("/:id/dislike", protect, toggleDislike);

module.exports = router;
