import ConversationModel from "../models/Conversation.model.js";
import { addNewMessageToConversation } from "../methods/conversation.methods.js";

export async function initConversation(req, res) {
  try {
    const { senderId, receiverId } = req.body;

    const newConversation = await ConversationModel.create({
      senderId,
      receiverId,
      messages: [],
    });
    return res.status(200).json({ newConversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function addConversationMessage(req, res) {
  try {
    const { senderId, receiverId, content } = req.body;
    const conversationExist = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    if (conversationExist) {
      const updatedConversation = await addNewMessageToConversation({
        conversationId: conversationExist._id,
        senderId,
        content,
      });
      const latestMessageObj =
        updatedConversation.messages[updatedConversation.messages.length - 1];
      return res.status(200).json({ message: latestMessageObj });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getSingleConversation(req, res) {
  try {
    const { senderId, receiverId } = req.query;
    const conversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ "messages.createdAt": 1 });
    return res.status(200).json({ conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function deleteMessageFromConversation(req, res) {
  try {
    const { senderId, receiverId, messageId } = req.body;
    const conversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    const updatedConversation = await ConversationModel.findByIdAndUpdate(
      conversation._id,
      {
        $pull: {
          messages: {
            _id: messageId,
          },
        },
      },
      { new: true }
    );
    return res.status(200).json({ messages: updatedConversation.messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function editMessageFromConversation(req, res) {
  try {
    const { senderId, receiverId, messageId, content } = req.body;
    const conversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    const updatedConversation = await ConversationModel.findOneAndUpdate(
      { _id: conversation._id, "messages._id": messageId },
      {
        $set: {
          "messages.$.content": content,
          "messages.$.updatedAt": Date.now(),
        },
      },
      { new: true }
    );
    return res.status(200).json({ messages: updatedConversation.messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
