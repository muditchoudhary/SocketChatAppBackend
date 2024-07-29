import express from "express";

import {
  addConversationMessage,
  getSingleConversation,
  deleteMessageFromConversation,
  editMessageFromConversation,
  initConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/init-conversation", initConversation);
router.post("/new-conversation", addConversationMessage);
router.get("/get-conversation", getSingleConversation);
router.delete("/delete-message", deleteMessageFromConversation);
router.put("/edit-message", editMessageFromConversation);

export default router;
