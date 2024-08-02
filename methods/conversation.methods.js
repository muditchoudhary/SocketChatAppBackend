import ConversationModel from "../models/Conversation.model.js";

export const addNewMessageToConversation = async ({
  conversationId,
  senderId,
  content,
}) => {
  const updatedConversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
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
  return updatedConversation;
};

export const getConversationsWithConvId = async ({ senderId, receiverId }) => {
  let conversation = {};
  try {
    conversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ "messages.createdAt": 1 });
    if (!conversation) {
      conversation = await ConversationModel.create({
        senderId,
        receiverId,
        messages: [],
      });
    }
    return conversation;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const deleteMessageFromConversation = async ({
  conversationId,
  messageId,
}) => {
  const updatedConversation = await ConversationModel.findOneAndUpdate(
    { _id: conversationId, "messages._id": messageId },
    {
      $set: {
        "messages.$.content": "Message has been deleted",
        "messages.$.updatedAt": Date.now(),
        "messages.$.isDeleted": true,
      },
    },
    { new: true }
  );
  return updatedConversation;
};

export const editMessageFromConversation = async ({
  conversationId,
  messageId,
  content,
}) => {
  const updatedConversation = await ConversationModel.findOneAndUpdate(
    { _id: conversationId, "messages._id": messageId },
    {
      $set: {
        "messages.$.content": content,
        "messages.$.updatedAt": Date.now(),
        "messages.$.isEdited": true,
      },
    },
    { new: true }
  );
  return updatedConversation;
};
