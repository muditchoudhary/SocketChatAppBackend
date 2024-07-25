import UserModel from "../models/User.model.js";

export async function login(req, res) {
  try {
    const userName = req.body.userName;
    const password = req.body.password;
    if (!userName || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const user = await UserModel.findOne({
      userName,
    });

    if (!user) {
      let newUser = new UserModel({
        userName: userName,
        password: password,
      });
      let result = await newUser.save();
      console.log("result is: ", result);

      if (result) {
        return res.status(200).json({
          message: "User Registered",
          result,
        });
      }
    } else {
      console.log("user is: ", user);
      return res.status(200).json({
        message: "Log in successfull",
        user,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
