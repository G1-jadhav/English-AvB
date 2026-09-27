export function setupQuizSocket(io, roomManager) {
  io.on("connection", (socket) => {
    // 1. Create Room
    socket.on("create-room", ({ hostId, hostName, hostAvatar, category, difficulty, questionCount, timePerQuestion }, callback) => {
      try {
        const room = roomManager.createRoom({
          hostId,
          hostName,
          hostAvatar,
          category,
          difficulty,
          questionCount,
          timePerQuestion,
          socketId: socket.id
        });

        socket.join(room.roomId);

        if (typeof callback === "function") {
          callback({
            success: true,
            roomId: room.roomId,
            hostId: room.hostPlayer.id,
            room: roomManager.sanitizeRoom(room)
          });
        }
      } catch (err) {
        if (typeof callback === "function") {
          callback({ success: false, error: err.message });
        }
      }
    });

    // 2. Join Room
    socket.on("join-room", ({ roomId, guestId, playerName, playerAvatar }, callback) => {
      try {
        const result = roomManager.joinRoom({
          roomId,
          guestId,
          playerName,
          playerAvatar,
          socketId: socket.id
        });

        if (result.error) {
          if (typeof callback === "function") {
            callback({ success: false, error: result.error });
          }
          return;
        }

        const room = result.room;
        socket.join(room.roomId);

        // Notify both players in the room
        io.to(room.roomId).emit("player-joined", {
          room: roomManager.sanitizeRoom(room),
          guestPlayer: roomManager.sanitizePlayer(room.guestPlayer)
        });

        if (typeof callback === "function") {
          callback({
            success: true,
            roomId: room.roomId,
            guestId: room.guestPlayer.id,
            room: roomManager.sanitizeRoom(room)
          });
        }
      } catch (err) {
        if (typeof callback === "function") {
          callback({ success: false, error: err.message });
        }
      }
    });

    // 3. Start Quiz (Host only)
    socket.on("start-quiz", ({ roomId }, callback) => {
      const room = roomManager.getRoom(roomId);
      if (!room) {
        if (typeof callback === "function") callback({ success: false, error: "Room not found." });
        return;
      }

      if (room.hostPlayer.socketId !== socket.id) {
        if (typeof callback === "function") callback({ success: false, error: "Only the host can start the quiz." });
        return;
      }

      if (!room.guestPlayer) {
        if (typeof callback === "function") callback({ success: false, error: "Waiting for opponent to join." });
        return;
      }

      roomManager.startCountdown(room.roomId);
      if (typeof callback === "function") callback({ success: true });
    });

    // 4. Submit Answer
    socket.on("submit-answer", ({ roomId, questionIndex, answer }, callback) => {
      const result = roomManager.submitAnswer({
        roomId,
        socketId: socket.id,
        questionIndex,
        answer
      });

      if (typeof callback === "function") {
        callback(result || { error: "Submission failed" });
      }
    });

    // 5. Reconnect Room
    socket.on("reconnect-room", ({ roomId, playerId }, callback) => {
      const result = roomManager.reconnectPlayer({
        roomId,
        playerId,
        socketId: socket.id
      });

      if (result.success) {
        socket.join(roomId);
      }

      if (typeof callback === "function") {
        callback(result);
      }
    });

    // 6. Play Again / Reset
    socket.on("play-again", ({ roomId }) => {
      const room = roomManager.getRoom(roomId);
      if (room) {
        roomManager.restartQuiz(room.roomId);
      }
    });

    // 7. Leave Room
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      roomManager.leaveRoom(socket.id, roomId);
    });

    // 8. Disconnect
    socket.on("disconnect", () => {
      roomManager.handleDisconnect(socket.id);
    });
  });
}
