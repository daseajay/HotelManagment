import { Comment } from "../models/comment.model.js";
import { APIResponce } from "../utils/ApiReasponce.js";
import { AsyncHandle } from "../utils/AsyncHandle.js";

export const postComment = AsyncHandle(async (req, res) => {
  const newcomment = new Comment(req.body);
  await newcomment.save();
  // Return success response
  return res.status(201).json(
    new APIResponce(201, "Comment added successfully", {
      comment: newcomment,
    })
  );
});

// get total comments..
export const Totalcomment = AsyncHandle(async (req, res) => {
  // Count the total number of comments
  const totalComments = await Comment.countDocuments({});

  // Return a success response with the total count
  return res
    .status(200)
    .json(
      new APIResponce(
        200,
        "Total comments retrieved successfully",
        totalComments
      )
    );
});
