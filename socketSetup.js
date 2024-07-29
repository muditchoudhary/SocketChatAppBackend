export function initSocket(io) {
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
    let onlineUsers = {};
    for (let [key, value] of users) {
      const userOjb = value;
      onlineUsers[userOjb.userId] = userOjb;
    }
    return onlineUsers;
  };

  io.on("connection", (socket) => {
    console.log("new user connected, socket id: ", socket.id);
    console.log("existing users are: ", users);
    socket.on("addUser", (socketId, userId, userName) => {
      addUser(userId, socketId, userName);
      console.log("total users after adding a user are: ", users);
      const usersObject = getOnlineUsers();
      io.emit("getUsers", usersObject);
    });

    socket.on("removeUser", (userId) => {
      users.delete(userId);
    });

    socket.on(
      "sendMessage",
      (senderId, receiverId, message, conversationId) => {
        console.log("Total active users are: ", users);
        const receiverUsers = getAllRecieverUser(receiverId);
        const selfUsers = getAllSelf(senderId);
        console.log("reciveUsers are: ", receiverUsers);
        console.log("self users are: ", selfUsers);
        if (receiverUsers) {
          for (const receiver of receiverUsers) {
            const receiverUserSocketId = receiver.socketId;
            console.log(`emitting event to: ${receiverUserSocketId}`);
            io.to(receiverUserSocketId).emit(
              "getMessage",
              message,
              conversationId
            );
          }
        }
        for (const self of selfUsers) {
          io.to(self.socketId).emit("getMessage", message, conversationId);
        }
      }
    );

    socket.on(
      "updateMessages",
      (senderId, receiverId, messages, conversationId) => {
        const receiverUsers = getAllRecieverUser(receiverId);
        const selfUsers = getAllSelf(senderId);
        if (receiverUsers) {
          for (const receiver of receiverUsers) {
            const receiverUserSocketId = receiver.socketId;
            console.log(`emitting event to: ${receiverUserSocketId}`);
            io.to(receiverUserSocketId).emit(
              "getUpdateMessages",
              messages,
              conversationId
            );
          }
        }
        for (const self of selfUsers) {
          io.to(self.socketId).emit(
            "getUpdateMessages",
            messages,
            conversationId
          );
        }
      }
    );

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
