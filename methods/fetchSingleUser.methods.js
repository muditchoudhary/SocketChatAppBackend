import UserModel from "../models/User.model.js";

export async function getSingleUser({ receiverId }) {
  try {
    console.log("receiverId-Single", receiverId);
    let result = await UserModel.findOne({ _id: receiverId });
    console.log("result", result);

    if (result) return result;
  } catch (error) {
    console.log(error);
  }
}
