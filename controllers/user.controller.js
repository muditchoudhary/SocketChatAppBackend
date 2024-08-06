import UserModel from "../models/User.model.js";
import { issueJWT } from "../config/jwtUtil.js";

export async function blockuser(req, res) {
  try {
    // Log the request body to check the incoming data
    console.log(req);

    const { userIdToToggle } = req.body;

    const { userId } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.blockedUsers.includes(userIdToToggle)) {
      await UserModel.findByIdAndUpdate(userId, {
        $pull: { blockedUsers: userIdToToggle },
      });
      res.status(200).json({ message: "User unblocked successfully." });
    } else {
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: { blockedUsers: userIdToToggle },
      });
      res.status(200).json({ message: "User blocked successfully." });
    }
  } catch (error) {
    console.error("Error:", error); // More detailed error logging
    res.status(500).json({ message: "An error occurred.", error });
  }
}

// export async function blockuser(req, res, io) {
//   try {
//     const { userIdToToggle } = req.body;
//     const { userId } = req.body;

//     const user = await UserModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const isBlocked = user.blockedUsers.includes(userIdToToggle);

//     await UserModel.findByIdAndUpdate(userId, {
//       $set: {
//         blockedUsers: isBlocked
//           ? user.blockedUsers.filter((id) => id !== userIdToToggle)
//           : [...user.blockedUsers, userIdToToggle],
//       },
//     });

//     // Emit socket event to all connected clients
//     io.emit("userBlockedStatusChanged", {
//       userId,
//       userIdToToggle,
//       isBlocked: !isBlocked, // Invert the flag for clarity
//     });

//     res.status(200).json({
//       message: isBlocked
//         ? "User unblocked successfully."
//         : "User blocked successfully.",
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "An error occurred.", error });
//   }
// }
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
      let user = await newUser.save();
      const tokenObject = issueJWT(user);
      if (user) {
        return res.status(200).json({
          message: "User Registered",
          token: tokenObject.token,
          expiresIn: tokenObject.expires,
          user: {
            userName: user.userName,
            id: user._id,
            blockedUsers: user.blockedUsers,
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

      const tokenObject = issueJWT(user);
      return res.status(200).json({
        message: "Log in successful",
        token: tokenObject.token,
        expiresIn: tokenObject.expires,
        user: {
          userName: user.userName,
          id: user._id,
          blockedUsers: user.blockedUsers,
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
      .select({ _id: 1, userName: 1, blockedUsers: 1 })
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
          blockedUsers: result.blockedUsers,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server Error",
    });
  }
}
