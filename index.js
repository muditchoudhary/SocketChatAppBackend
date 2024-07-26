import express from "express";
import cors from "cors";

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

import connectToDB from "./db/dbConfig.js";

import conversationRoutes from "./routes/conversation.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use("/user", userRoutes);
app.use("/conversation", conversationRoutes);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// socket.io logic
let users = [];
// [
//   {userId: 'abce', socketId}
// ]

const addUser = (userId, socketId) => {
  // If not any one user found with the given id then only
  // add user to the users
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", async (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ receiverPerson, newMessage }) => {
    const receiverId = receiverPerson._id;
    // getting the user because we need to know it's socket id
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", { newMessage });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, async () => {
  await connectToDB();

  console.log("server running at http://localhost:3000");
});
