import { Router } from "express";
import {
  LoginUser,
  LogoutUser,
  registerUser,
  Getusers,
  DeletUser,
  updateUserRole,
  AdminAction,
} from "../controllers/User.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AdminOnly, VerifyJWT } from "../middlewares/Auth.middlewares.js";

const router = Router();
router.route("/resgister").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(LoginUser);
router.route("/logout").post(VerifyJWT, LogoutUser);
router.route("/admin").post(VerifyJWT, AdminOnly, AdminAction);
router.route("/getallusers").get(Getusers);
router.route("/deletuser/:id").delete(DeletUser);
router.route("/updaterole/:id").put(updateUserRole);

export default router;
