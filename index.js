import express from "express";
import cors from "cors";

import { createServer } from "node:http";
import { Server } from "socket.io";

import connectToDB from "./db/dbConfig.js";

import conversationRoutes from "./routes/conversation.routes.js";
import userRoutes from "./routes/user.routes.js";
import { initSocket } from "./socketSetup.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: ["https://admin.socket.io", "http://localhost:5173"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRoutes);
app.use("/conversation", conversationRoutes);

app.get("/", (req, res) => {
  res.send("Hello world! working");
});

server.listen(3000, async () => {
  await connectToDB();
  initSocket(io);
  console.log("server running at http://localhost:3000");
});
