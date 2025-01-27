import { Router } from "express";
import {
  createBlog,
  DeleteBlog,
  getallBlog,
  getsingelBlog,
  reletdBlog,
  UpdataBlog,
} from "../controllers/Blogs.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AdminOnly, VerifyJWT } from "../middlewares/Auth.middlewares.js";

const router = Router();
// create Blogs
router.route("/create-post").post(
  upload.fields([
    {
      name: "BlogImg",
      maxCount: 1,
    },
  ]),
  VerifyJWT,
  AdminOnly,
  createBlog
);
// getall Blogs
router.route("/get-allglogs/").get(getallBlog);
router.route("/get-singleblog/:id").get(getsingelBlog);
router.route("/update-blog/:id").put(UpdataBlog);
router.route("/delete-blog/:id").delete(DeleteBlog);
router.route("/releted-post/:id").get(reletdBlog);
export default router;
