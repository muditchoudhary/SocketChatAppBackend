import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authorization = (req, res, next) => {
  const authHeader = req.headers;

  // Logging to debug
  //   console.log(
  //     "Authorization Middleware: authHeader:",
  //     authHeader.authorization
  //   );

  if (!authHeader.authorization) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized: No authorization header provided",
    });
  }

  if (!authHeader.authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized: Invalid token format",
    });
  }

  const token = authHeader.authorization.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized: Invalid token",
    });
  }
};
