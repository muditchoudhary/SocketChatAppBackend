import {
  addNewMessageToConversation,
  deleteMessageFromConversation,
  editMessageFromConversation,
  getConversationsWithConvId,
} from "./methods/conversation.methods.js";
import { fetchAllUsers } from "./methods/users.methods.js";
import UserModel from "./models/User.model.js";
import { toggleBlockUser } from "./methods/block.methos.js";
import { fetchUserBlockList } from "./methods/fetchUserBlockList.methods.js";
import { getSingleUser } from "./methods/fetchSingleUser.methods.js";
export function initSocket(io) {
  async function checkBlockedUser(senderId, receiverId, next) {
    try {
      const receiver = await UserModel.findById(receiverId);
      const sender = await UserModel.findById(senderId);

      if (!receiver || !sender) {
        return next(new Error("Sender or Receiver not found."));
      }

      if (receiver.blockedUsers.includes(senderId)) {
        return next(new Error("User is blocked and cannot send messages."));
      } else if (sender.blockedUsers.includes(receiverId)) {
        return next(new Error("You blocked this user"));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  }

  // socket.io logic
  let users = new Map();
  const addUser = (userId, socketId, userName) => {
    // If not any one user found with the given id then only
    // add user to the users
    if (!users.has(socketId)) {
      users.set(socketId, {
        userId,
        socketId,
        userName,
      });
    }
  };

  const getAllRecieverUser = (receiverId) => {
    // T: O(n)
    const recievers = [];
    for (let [key, value] of users) {
      const userObj = value;
      if (userObj.userId === receiverId) recievers.push(userObj);
    }
    return recievers;
  };

  const getAllSelf = (selfId) => {
    // T: O(n)
    let self = [];
    for (let [key, value] of users) {
      const userObj = value;
      if (userObj.userId === selfId) self.push(userObj);
    }
    return self;
  };

  const getOnlineUsers = () => {
    // T: O(n)
    /*onlineUsers = {
      'UserId[66a4d496a633c8dc217c6916]': {
        userId: ,
        sockedId: ,
        userName: ,
      }
    }*/
    let onlineUsers = {};

    for (let [key, value] of users) {
      const userOjb = value;
      onlineUsers[userOjb.userId] = userOjb;
    }
    return onlineUsers;
  };

  io.on("connection", (socket) => {
    socket.on("addUser", async (userId, userName) => {
      addUser(userId, socket.id, userName);
      const usersObject = getOnlineUsers();
      io.emit("getUsers", usersObject);
      const fetchedAllUsers = await fetchAllUsers();
      io.emit("getAllUsers", { fetchedAllUsers });
      const fetchUserBlockArray = await fetchUserBlockList({
        senderId: userId,
      });
      socket.emit("fetchUserBlockList", { fetchUserBlockArray });
    });

    socket.on("removeUser", (userId) => {
      users.delete(userId);
    });

    socket.on(
      "typing",
      ({ senderId, receiverId, currentConversationId, isTyping }) => {
        const receiverUsers = getAllRecieverUser(receiverId);
        if (receiverUsers) {
          for (const receiver of receiverUsers) {
            const receiverUserSocketId = receiver.socketId;
            io.to(receiverUserSocketId).emit("userTyping", {
              isTyping,
              givenConversationId: currentConversationId,
            });
          }
        }
      }
    );

    socket.on(
      "sendMessage",
      async (senderId, receiverId, message, conversationId, callback) => {
        try {
          // TODO ADD SNED MESSAGE HERE
          const updatedConversation = await addNewMessageToConversation({
            conversationId,
            senderId,
            content: message,
          });
          const latestMessageObj =
            updatedConversation.messages[
              updatedConversation.messages.length - 1
            ];
          const receiverUsers = getAllRecieverUser(receiverId);
          const selfUsers = getAllSelf(senderId);

          if (receiverUsers) {
            for (const receiver of receiverUsers) {
              const receiverUserSocketId = receiver.socketId;
              io.to(receiverUserSocketId).emit(
                "getMessage",
                latestMessageObj,
                conversationId
              );
            }
          }
          for (const self of selfUsers) {
            io.to(self.socketId).emit(
              "getMessage",
              latestMessageObj,
              conversationId
            );
          }
          callback({
            acknowledgement: {
              success: true,
            },
          });
        } catch (error) {
          console.error("Error processing sendMessage event: ", error);
          socket.emit("error", "An error occurred while sending the message.");
        }
      }
    );

    socket.on(
      "updateMessages",
      async (
        messageId,
        senderId,
        receiverId,
        content,
        conversationId,
        updateType
      ) => {
        let updatedConversation = {};
        if (updateType === "deleted") {
          updatedConversation = await deleteMessageFromConversation({
            conversationId,
            messageId,
          });
        } else if (updateType === "edited") {
          updatedConversation = await editMessageFromConversation({
            conversationId,
            messageId,
            content,
          });
        }

        const receiverUsers = getAllRecieverUser(receiverId);
        const selfUsers = getAllSelf(senderId);
        let message = updatedConversation.messages;

        if (receiverUsers) {
          for (const receiver of receiverUsers) {
            const receiverUserSocketId = receiver.socketId;
            console.log(`emitting event to: ${receiverUserSocketId}`);
            io.to(receiverUserSocketId).emit(
              "getUpdateMessages",
              message,
              conversationId
            );
          }
        }
        for (const self of selfUsers) {
          io.to(self.socketId).emit(
            "getUpdateMessages",
            message,
            conversationId
          );
        }
      }
    );

    socket.on(
      "wantConversations",
      async ({ senderId, receiverId }, callback) => {
        const conversation = await getConversationsWithConvId({
          senderId,
          receiverId,
        });
        callback({
          acknowledgement: {
            conversation,
          },
        });
      }
    );

    socket.on("toggleBlock", async ({ senderId, receiverId }, cb) => {
      const { success } = await toggleBlockUser({ senderId, receiverId });

      const fetchedAllUsers = await fetchAllUsers();

      const fetchUserBlockArray = await fetchUserBlockList({ senderId });

      const getSingleUserDetails = await getSingleUser({
        receiverId: senderId,
      });

      console.log(fetchUserBlockArray, "block list");
      const receiverUsers = getAllRecieverUser(receiverId);
      const selfUsers = getAllSelf(senderId);

      if (receiverUsers) {
        for (const receiver of receiverUsers) {
          const receiverUserSocketId = receiver.socketId;
          io.to(receiverUserSocketId).emit("getAllUsers", {
            fetchedAllUsers: fetchedAllUsers,
          });
          io.to(receiverUserSocketId).emit("getSingleUser", {
            getSingleUserDetails,
          });
        }
      }
      for (const self of selfUsers) {
        io.to(self.socketId).emit("getAllUsers", { fetchedAllUsers });
        io.to(self.socketId).emit("fetchUserBlockList", {
          fetchUserBlockArray,
        });
      }
      cb({
        acknowledgement: {
          success: true,
        },
      });
    });

    socket.on("singleUser", async ({ receiverId }, cb) => {
      const getSingleUserDetails = await getSingleUser({ receiverId });
      console.log(getSingleUserDetails, "single User");

      socket.emit("getSingleUser", { getSingleUserDetails });

      cb({
        acknowledgement: {
          success: true,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log(socket.id);
      users.forEach((value, key, map) => {
        const user = value;
        if (user.socketId === socket.id) map.delete(socket.id);
      });
      // if (usersObjArr) {
      //   users = new Map(
      //     usersObjArr.filter((user) => user.socketId !== socket.id)
      //   );
      // }
      console.log(`A user has been disconnected`);
      console.log("users left after disconnect: ", users);
      const usersObject = getOnlineUsers();
      io.emit("getUsers", usersObject);
    });
  });
}
