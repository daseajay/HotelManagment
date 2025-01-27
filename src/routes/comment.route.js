import { Router } from "express";
import {
  postComment,
  Totalcomment,
} from "../controllers/comment.controllers.js";

const router = Router();

router.route("/post-comment").post(postComment);
router.route("/totol-comments").get(Totalcomment);
export default router;
