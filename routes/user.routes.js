import express from "express";
import { authorization } from "../config/authorization.js";
import {
  login,
  getUser,
  getSingleUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/getUser", authorization, getUser);
router.get("/singleUser/:id", authorization, getSingleUser);

export default router;
