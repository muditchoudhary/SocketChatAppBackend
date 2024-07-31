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
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
