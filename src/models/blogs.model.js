import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    BlogImg: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      min: 0,
      max: 5, // Example range for ratings
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", BlogSchema);
