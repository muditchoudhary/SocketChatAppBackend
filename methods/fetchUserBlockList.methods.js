import UserModel from "../models/User.model.js";

export async function fetchUserBlockList({ senderId }) {
  try {
    let result = await UserModel.findOne({ _id: senderId });

    if (result) return result.blockedUsers;
  } catch (error) {
    console.log(error);
  }
}
