import express from "express";
import { addConversationMessage } from "../controllers/conversation.controller.js";

const router = express.Router();

// add message
router.post("/message", addConversationMessage);

export default router;
