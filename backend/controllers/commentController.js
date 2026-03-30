const Comment = require("../models/Comment");

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ recipeSignature: req.params.signature })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    if (text.trim().length > 500) {
      return res.status(400).json({ message: "Comment is too long" });
    }

    const comment = await Comment.create({
      recipeSignature: req.params.signature,
      userId: req.user._id,
      userName: req.user.name,
      text: text.trim(),
    });

    return res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;
    const alreadyLiked = comment.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => !id.equals(userId));
    } else {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter((id) => !id.equals(userId));
    }

    await comment.save();
    return res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length, liked: !alreadyLiked });
  } catch (error) {
    next(error);
  }
};

const toggleDislike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;
    const alreadyDisliked = comment.dislikes.some((id) => id.equals(userId));

    if (alreadyDisliked) {
      comment.dislikes = comment.dislikes.filter((id) => !id.equals(userId));
    } else {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter((id) => !id.equals(userId));
    }

    await comment.save();
    return res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length, disliked: !alreadyDisliked });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, addComment, toggleLike, toggleDislike };
