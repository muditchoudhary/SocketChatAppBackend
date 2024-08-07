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
  } else {
    await UserModel.findByIdAndUpdate(senderId, {
      $addToSet: { blockedUsers: receiverId },
    });
  }
  return { success: true };
}
