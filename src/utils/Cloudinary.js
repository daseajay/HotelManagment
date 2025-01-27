import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({
  path: "./.env",
});
// Validate environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const UploadCloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;
    //  uplead the file on cloudinary....
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });
    // file hasbeen uploaded on cloudinary Successfully
    console.log("file hasbeen uploaded on successFully", response.url);
    // Return the response object (or just the URL, depending on your needs)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilepath);
    return null;
  }
};

export { UploadCloudinary };
