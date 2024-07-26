import express from "express";
import {
  login,
  getUser,
  getSingleUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/getUser", getUser);
router.get("/singleUser/:id", getSingleUser);

export default router;
