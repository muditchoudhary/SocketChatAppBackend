import UserModel from "../models/User.model.js";

export async function getSingleUser({ receiverId }) {
  try {
    let result = await UserModel.findOne({ _id: receiverId });

    if (result) return result;
  } catch (error) {
    console.log(error);
  }
}
