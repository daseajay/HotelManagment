import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Comment text is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Blog",
      required: [true, "Post ID is required"],
    },
  },
  { timestamps: true } // Automatically handles `createdAt` and `updatedAt`
);

export const Comment = mongoose.model("Comment", commentSchema);
