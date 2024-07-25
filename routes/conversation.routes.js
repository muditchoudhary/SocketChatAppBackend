import express from "express";

import {
  addConversationMessage,
  getSingleConversation,
  deleteMessageFromConversation,
  editMessageFromConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/new-conversation", addConversationMessage);
router.get("/get-conversation", getSingleConversation);
router.delete("/delete-message", deleteMessageFromConversation);
router.put("/edit-message", editMessageFromConversation);

export default router;
