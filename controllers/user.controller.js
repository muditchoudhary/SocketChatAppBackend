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
<<<<<<< HEAD
        res.status(400).json({
=======
        return res.status(200).json({
>>>>>>> origin/mudit
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

export async function getUser(req, res) {
  try {
    const allUser = await UserModel.find()
      .select({ _id: 1, userName: 1 })
      .exec();

    if (!allUser)
      return res.status(404).json({
        message: "No User Found",
      });

    return res.status(200).json({
      message: "Users fetched",
      allUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server Error",
    });
  }
}

export async function getSingleUser(req, res) {
  try {
    let result = await UserModel.findOne({ _id: req.params.id });

    if (result)
      return res.status(200).json({
        message: "User feteched",
        result: {
          userName: result.userName,
          id: result._id,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server Error",
    });
  }
}
