import UserModel from "../models/User.model.js";

export async function toggleBlockUser({ senderId, receiverId }) {
  const user = await UserModel.findById(senderId);
  if (!user) {
    return console.log("User not found");
  }

  if (user.blockedUsers.includes(receiverId)) {
    await UserModel.findByIdAndUpdate(senderId, {
      $pull: { blockedUsers: receiverId },
    });
    console.log("User Unblocked Successfully");
  } else {
    await UserModel.findByIdAndUpdate(senderId, {
      $addToSet: { blockedUsers: receiverId },
    });
    console.log("User blocked Successfully");
  }
  return { success: true };
}
