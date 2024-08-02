import UserModel from "../models/User.model.js";
export const fetchAllUsers = async () => {
  const allUser = await UserModel.find().select({ _id: 1, userName: 1 }).exec();
  if (!allUser) return [];
  return allUser;
};
