import { ApiError } from "../utils/ApiError.js";
import { AsyncHandle } from "../utils/AsyncHandle.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const VerifyJWT = AsyncHandle(async (req, res, next) => {
  try {
    const token =
      req.cookies?.AccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "UnAuthorization request");
    }

    // Verify the JWT
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Find the user based on the decoded token

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach the user to the request object
    // req.user = { ...user.toObject(), role: user.role };

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid Access Token. JWT verification failed.");
  }
});

// Admin Authorization Middleware
export const AdminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admins only.");
  }
  next();
};

// export const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       throw new ApiError(403, "Access denied. Insufficient permissions.");
//     }
//     next();
//   };
// };
