import UserModel from "../models/User.model.js";

export async function login(req, res) {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const user = await UserModel.findOne({ userName });

    if (!user) {
      // Register new user if not found
      const newUser = new UserModel({ userName, password });
      const result = await newUser.save();

      if (result) {
        return res.status(200).json({
          message: "User Registered",
          result: {
            userName: result.userName,
            id: result._id,
          },
        });
      }
    } else {
      // Check if the password is correct
      if (user.password !== password) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      // Log in successful
      return res.status(200).json({
        message: "Log in successful",
        user: {
          userName: user.userName,
          id: user._id,
        },
      });
    }
  } catch (error) {
    console.error("Error during login process:", error);
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
