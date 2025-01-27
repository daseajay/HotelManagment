import ConnectionDB from "./DB/Db.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import userRoute from "./routes/User.route.js";
import blogsRoute from "./routes/Blogs.route.js";
import userComment from "./routes/comment.route.js";
dotenv.config({
  path: "./.env",
});

const app = express();

// parse options
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieparser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ limit: "20kb" }));
app.use(express.static("public"));
// parse options end

// Route declearation....
app.use("/api/v1/users/", userRoute);
app.use("/api/v1/blogs/", blogsRoute);
app.use("/api/v1/comment/", userComment);
//Db connetion..
const PORT = process.env.PORT || 4000;
ConnectionDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server started at ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`mongoDb connection error ${error}`);
  });
