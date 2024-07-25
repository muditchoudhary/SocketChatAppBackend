import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
});

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
