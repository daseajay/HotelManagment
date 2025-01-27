import mongoose from "mongoose";
import { DB_NAME } from "../contestants.js";

const ConnectionDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MongoDB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDb connetion host is :${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MongoDb connection Failed:${error}`);
    process.exit(1);
  }
};

export default ConnectionDB;
