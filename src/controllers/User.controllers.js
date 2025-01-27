import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandle } from "../utils/AsyncHandle.js";
import bcrypt from "bcrypt";
import { UploadCloudinary } from "../utils/Cloudinary.js";
import { APIResponce } from "../utils/ApiReasponce.js";

// creating Accesstoken and RefreshToken
const generatingAccsstokenandRefrshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();
    // save resfreshToken on database
    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });
    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong on while generating tokens");
  }
};
export const registerUser = AsyncHandle(async (req, res) => {
  try {
    //  get details from Frontend
    const { username, email, password } = req.body;
    // validation-not empty field
    if (!username || !email || !password) {
      throw new ApiError(400, "All filed required");
    }
    // Ckeck If user already exists or not
    const exiteUser = await User.findOne({ email });

    if (exiteUser) {
      throw new ApiError(409, "email is all ready exist");
    }
    // Validate role (only Admin can assign the Admin role)
    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

    // hash password
    const hashPaswsord = await bcrypt.hash(password, 10);

    // check fro Avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    // Upload them Cloudinary
    const avatar = await UploadCloudinary(avatarLocalPath);

    // Create user Object-Create Enter in Db
    const user = await User.create({
      username,
      email,
      password: hashPaswsord,
      avatar: avatar.url,
      role,
    });
    // Reamove the password on db
    const createUser = await User.findById(user._id).select("-password");

    if (!createUser) {
      throw new ApiError(500, "something went wrong registering the user");
    }
    // response
    return res
      .status(201)
      .json(new APIResponce(201, createUser, "User registered SuccessFully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new APIResponce(500, "Internal server error"));
  }
});
// LogIn User....
export const LoginUser = AsyncHandle(async (req, res) => {
  try {
    // req body -> data
    const { username, email, password } = req.body;
    // check username and email
    if (!username || !email || !password) {
      throw new ApiError(400, "All filed is required");
    }
    // find the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "user does not exist");
    }
    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid Password");
    }
    // accessToken and RefreshToken
    const { AccessToken, RefreshToken } =
      await generatingAccsstokenandRefrshToken(user._id);
    const loggedInuser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    // cookis
    // const options = {
    //   httpOnly: true,
    //   secure: true,
    // };
    // response
    return (
      res
        .status(200)
        // .cookie("AccessToken", AccessToken, options)
        // .cookie("RefreshToken", RefreshToken, options)
        .json(
          new APIResponce(
            200,
            {
              user: loggedInuser,
              AccessToken,
              RefreshToken,
            },
            "User Logged In successFully"
          )
        )
    );
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json(new APIResponce(500, "Internal server error"));
  }
});

// Logout user
export const LogoutUser = AsyncHandle(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new APIResponce(200, {}, "User logged out successfully"));
});

// admin authentication...
export const AdminAction = AsyncHandle(async (req, res) => {
  res.status(200).json({ message: "Admin action executed successfully" });
});
// export const Admin = AsyncHandle(async (req, res) => {
//   const { email, password } = req.body;
//   // Validate input
//   if (!email || !password) {
//     throw new ApiError(400, "Email and password are required.");
//   }
//   // Find user by email
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new ApiError(404, "Admin user not found.");
//   }
//   // Check if the user has admin privileges
//   if (user.role !== "admin") {
//     throw new ApiError(403, "Access denied. Not an admin.");
//   }
//   // Generate tokens
//   const { AccessToken, RefreshToken } =
//     await generatingAccsstokenandRefrshToken(user._id);
//   const adminUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );
//   // Set cookies
//   const options = { httpOnly: true, secure: true };
//   return res
//     .status(200)
//     .cookie("AccessToken", AccessToken, options)
//     .cookie("RefreshToken", RefreshToken, options)
//     .json(
//       new APIResponce(
//         200,
//         {
//           user: adminUser,
//           AccessToken,
//           RefreshToken,
//         },
//         "Admin logged in successfully."
//       )
//     );
// });

// get all users ...
export const Getusers = AsyncHandle(async (req, res) => {
  try {
    const allusers = await User.find({}, { _id: 1, email: 1, role: 1 });

    if (!allusers) {
      throw new ApiError(404, "users not found");
    }
    return res
      .status(200)
      .json(new APIResponce(201, allusers, "Userlist found successFully"));
  } catch (error) {
    console.error("userList", error);
    return res.status(500).json(new APIResponce(500, "Internal server error"));
  }
});
// delete user...
export const DeletUser = AsyncHandle(async (req, res) => {
  const userId = req.params.id;
  const deleteuser = await User.findByIdAndDelete(userId);
  if (!deleteuser) {
    throw new ApiError(404, "User is not found");
  }
  return res
    .status(200)
    .json(new APIResponce(201, "userDelete succefully", deleteuser));
});
// updata user role...
// export const updatauserRole = AsyncHandle(async (req, res) => {
//   const { id } = req.params.id;
//   const { role } = req.body;
//   const updaterole = await User.findByIdAndUpdate(
//     id,
//     { role },
//     {
//       new: true,
//     }
//   );
//   if (!updaterole) {
//     throw new ApiError(404, "usernot Found");
//   }
//   return res
//     .status(200)
//     .json(new APIResponce(201), "User updata successfully", updaterole);
// });
export const updateUserRole = AsyncHandle(async (req, res) => {
  const { id } = req.params; // Directly get `id` from params
  const { role } = req.body; // Destructure `role` from body
  // Validate Role
  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  // Update User Role
  const updatedRole = await User.findByIdAndUpdate(
    id,
    { role }, // Update only the `role` field
    { new: true } // Return the updated document
  );

  // Check if User Exists
  if (!updatedRole) {
    throw new ApiError(404, "User not found");
  }

  // Return Response
  return res
    .status(200)
    .json(new APIResponce(200, updatedRole, "User updated successfully"));
});
