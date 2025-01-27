import { Blog } from "../models/blogs.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { APIResponce } from "../utils/ApiReasponce.js";
import { AsyncHandle } from "../utils/AsyncHandle.js";
import { UploadCloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
// create blogs
export const createBlog = AsyncHandle(async (req, res) => {
  const { title, description, content, rating, category } = req.body;

  if (!title || !description || !content || !rating || !category) {
    throw new ApiError(401, "All Field is required");
  }
  // check from blogimage
  const blogeLocalpath = req.files?.BlogImg[0]?.path;
  if (!blogeLocalpath) {
    throw new ApiError(401, "Blog Imgae is required");
  }
  // upload them clodinary..
  const blogimage = await UploadCloudinary(blogeLocalpath);
  if (!blogimage) {
    throw new ApiError(401, "blogimage file is required");
  }
  // create  a new User instance..
  const newBlog = new Blog({
    title,
    description,
    content,
    BlogImg: blogimage.url, // Use Cloudinary URL
    author: req.user,
    category,
    rating,
  });
  // Save to the database
  await newBlog.save();
  return res
    .status(201)
    .json(new APIResponce(200, newBlog, "Blog Create successFully"));
});

// get all blogs
export const getallBlog = AsyncHandle(async (req, res) => {
  const Allblogs = await Blog.find();
  if (!Allblogs) {
    throw new ApiError(404, "Blogs are not Found");
  }
  return res.status(200).json(new APIResponce(200, "All Blogs", Allblogs));
});

// get single Blog
export const getsingelBlog = AsyncHandle(async (req, res) => {
  const userId = req.params.id;
  const singleBlog = await Blog.findById(userId);

  if (!singleBlog) {
    throw new ApiError(404, "Blog is not found");
  }

  // todo : with also fatch comment related to the post
  const comment = await Comment.find({ userId: userId }).populate(
    "user",
    "username email"
  );
  // Return a success response
  return res
    .status(200)
    .json(
      new APIResponce(200, "Blog fetched successfully", singleBlog, comment)
    );
});

// Update User Blog...
export const UpdataBlog = AsyncHandle(async (req, res) => {
  const userId = req.params.id;
  const updateBlog = await Blog.findByIdAndUpdate(userId, req.body, {
    new: true,
  });

  if (!updateBlog) {
    throw new ApiError(404, "user not found");
  }
  // Return a success response
  return res
    .status(200)
    .json(new APIResponce(200, "blog Updated SuccessFully", updateBlog));
});

// delete user Blog
export const DeleteBlog = AsyncHandle(async (req, res) => {
  const blogId = req.params.id; // Renamed to blogId for clarity

  // Use the Blog model to find and delete the blog by ID
  const deletedBlog = await Blog.findByIdAndDelete(blogId);

  // If the blog is not found, throw an error
  if (!deletedBlog) {
    throw new ApiError(404, "Blog not found");
  }

  // todo : delete related Comment
  await Comment.deleteMany({ blogId: blogId });
  // Return a success response
  return res
    .status(200)
    .json(new APIResponce(200, "Blog deleted successfully", deletedBlog));
});

// Get Related Posts

export const reletdBlog = AsyncHandle(async (req, res) => {
  const { id } = req.params;

  // Validate the post ID
  if (!id) {
    throw new ApiError(400, "Post ID is required");
  }

  // Validate the ID format (MongoDB ObjectId)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Post ID format");
  }

  // Find the blog post
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new ApiError(404, "Post not found");
  }

  // Create a regex pattern from the title
  const titleWords = blog.title.split(" ").filter((word) => word.length > 2); // Exclude short/common words
  const titleRegex = new RegExp(titleWords.join("|"), "i");

  // Query for related posts
  const relatedQuery = {
    _id: { $ne: id }, // Exclude the current blog
    title: { $regex: titleRegex }, // Match titles using regex
  };

  const reletedPost = await Blog.find(relatedQuery).limit(5); // Limit to 5 related posts

  // Return the related posts
  return res
    .status(200)
    .json(
      new APIResponce(200, "Related posts found successfully", reletedPost)
    );
});
