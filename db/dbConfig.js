import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const CHAT_APP_DB_URI = process.env.CHAT_APP_DB_URI;
let autoIncrement;
const connectToDB = async () => {
  try {
    const connection = await mongoose.connect(CHAT_APP_DB_URI, {
      autoIndex: true,
    });
    console.log("Connected to Mongodb Atlas");
  } catch (error) {
    console.error(error);
  }
};

export default connectToDB;
