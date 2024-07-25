import ConversationModel from "../models/Conversation.model.js";

export async function addConversationMessage(req, res) {
  try {
    const { senderId, receiverId, content } = req.body;
    console.log(senderId, receiverId, content);
    const conversationExist = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    if (conversationExist) {
      const updatedConversation = await ConversationModel.findByIdAndUpdate(
        conversationExist._id,
        {
          $push: {
            messages: {
              author_id: senderId,
              content: content,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          },
        },
        { new: true }
      );
      return res.status(200).json({ updatedConversation });
    }
    if (!conversationExist) {
      const newConversation = await ConversationModel.create({
        senderId,
        receiverId,
        messages: [
          {
            author_id: senderId,
            content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
      return res.status(200).json({ newConversation });
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
    const { senderId, receiverId } = req.body;
    const conversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
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
    await ConversationModel.findByIdAndUpdate(
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
    return res.status(200).json({ updatedConversation });
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
    return res.status(200).json({ updatedConversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
