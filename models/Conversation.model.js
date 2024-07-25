import mongoose from "mongoose";

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    messages: [
      {
        author_id: {
          type: String,
          required: true,
        },
        author: {
          type: "String",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);
export default ConversationModel;
