import ConversationModel from "../models/Conversation.model";

export async function addConversationMessage(req, res) {
  try {
    const { senderId, receiverId, author, content } = req.body;
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
              author: author,
              content: content,
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
            author: author,
            content,
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
    return res.status(200).json({ updatedConversation });
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

let doctorResult = await DoctorModel.updateOne(
  { _id: doctor._id, "appointments.commonId": commonId },
  {
    $set: {
      "appointments.$.appointmentAt": appointmentAt,
      "appointments.$.appointmentOn": appointmentOn,
    },
  }
);
export async function editMessageFromConversation(req, res) {
  try {
    const { senderId, receiverId, messageId, content } = req.body;
    const conversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    await ConversationModel.updateOne(
      { _id: conversation._id, "messages._id": messageId },
      {
        $set: {
          "messages.$.content": {
            content,
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
