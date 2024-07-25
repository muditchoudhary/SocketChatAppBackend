import express from "express";
import cors from "cors";

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

import connectToDB from "./db/dbConfig.js";
import MessageModel from "./models/Message.model.js";
import UserModel from "./models/User.model.js";
import ConversationModel from "./models/Conversation.model.js";
import conversationRotues from "./routes/conversation.routes.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", async (socket) => {
  socket.on("chat message", async (msg, senderId, receiverId) => {
    let result;
    try {
      let result = await ConversationModel.create({
        participants: [senderId, receiverId],
      });
      await MessageModel.create({
        sender: senderId,
        content: msg,
        converstationId: result._id,
      });
    } catch (e) {
      // TODO handle the failure
      return;
    }
    // include the offset with the message
    io.emit("chat message", msg);
  });

  // if (!socket.recovered) {
  //   // if the connection state recovery was not successful
  //   try {
  //     const serverOffset = socket.handshake.auth.serverOffset || 0;
  //     const cursor = MessageModel.find({
  //       unique_id: { $gt: serverOffset },
  //     }).sort({
  //       unique_id: 1,
  //     });
  //     await cursor.forEach((msg) => {
  //       socket.emit("chat message", msg.content, msg.unique_id);
  //     });
  //     await db.each(
  //       "SELECT id, content FROM messages WHERE id > ?",
  //       [socket.handshake.auth.serverOffset || 0],
  //       (_err, row) => {
  //         socket.emit("chat message", row.content, row.id);
  //       }
  //     );
  //   } catch (e) {
  //     // something went wrong
  //     console.error(e);
  //   }
  // }

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.post("/user/register", async (req, res) => {
  await UserModel.create({
    userName: req.body.userName,
    password: req.body.password,
  });
  return res.status(200).json({
    message: "usre registered",
  });
});

app.use("/conversation", conversationRotues);

server.listen(3000, async () => {
  await connectToDB();

  console.log("server running at http://localhost:3000");
});
