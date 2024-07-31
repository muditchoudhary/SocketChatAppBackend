import express from "express";
import {
  login,
  getUser,
  getSingleUser,
  blockuser,
} from "../controllers/user.controller.js";

import { authorization } from "../config/authorization.js";

const router = express.Router();

router.post("/login", login);
router.get("/getUser", authorization, getUser);
router.get("/singleUser/:id", authorization, getSingleUser);
router.post("/blockUser/", authorization, blockuser);

export default router;
