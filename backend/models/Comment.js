const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    recipeSignature: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
