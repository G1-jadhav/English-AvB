import { getQuizQuestions } from "../data/questions.js";

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid easily confused chars like 0, O, 1, I
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const QUESTION_DURATION = 10;
export const QUESTION_DURATION_MS = 10000;
export const INTERMISSION_DURATION_MS = 2500;

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  createRoom({ hostId, hostName, hostAvatar, category = "Mixed English", difficulty = "medium", questionCount = 10, timePerQuestion = QUESTION_DURATION, socketId }) {
    let roomId = generateRoomId();
    while (this.rooms.has(roomId)) {
      roomId = generateRoomId();
    }

    const host = {
      id: hostId || ("host_" + Math.random().toString(36).substring(2, 9)),
      socketId,
      name: hostName || "Player 1",
      avatar: hostAvatar || "avatar-1",
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      connected: true,
      role: "host",
      disconnectTimer: null
    };

    const questions = getQuizQuestions(category, difficulty, questionCount);

    const room = {
      roomId,
      hostPlayer: host,
      guestPlayer: null,
      quizSettings: {
        category,
        difficulty,
        questionCount: questions.length,
        timePerQuestion: QUESTION_DURATION
      },
      questions,
      currentQuestionIndex: 0,
      gameStatus: "waiting", // 'waiting' | 'starting' | 'in-progress' | 'intermission' | 'completed' | 'closed'
      questionState: {
        player1Answer: null,
        player2Answer: null,
        player1Answered: false,
        player2Answered: false,
        status: "IDLE"
      },
      questionStartTime: null,
      questionEndTime: null,
      timerHandle: null,
      intermissionHandle: null,
      countdownHandle: null,
      timeLeft: QUESTION_DURATION,
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.toUpperCase().trim());
  }

  joinRoom({ roomId, guestId, playerName, playerAvatar, socketId }) {
    const code = roomId.toUpperCase().trim();
    const room = this.rooms.get(code);

    if (!room) {
      return { error: "Room not found. Check the Room ID and try again." };
    }

    if (room.gameStatus !== "waiting") {
      return { error: "This quiz has already started or finished." };
    }

    if (room.guestPlayer && room.guestPlayer.connected) {
      return { error: "This quiz already has two players." };
    }

    let finalGuestId = guestId || ("guest_" + Math.random().toString(36).substring(2, 9));
    if (finalGuestId === room.hostPlayer.id) {
      finalGuestId = "guest_" + Math.random().toString(36).substring(2, 9);
    }

    const guest = {
      id: finalGuestId,
      socketId,
      name: playerName || "Player 2",
      avatar: playerAvatar || "avatar-2",
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      connected: true,
      role: "guest",
      disconnectTimer: null
    };

    room.guestPlayer = guest;
    return { room };
  }

  startCountdown(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.gameStatus !== "waiting") return;
    if (!room.guestPlayer) return;

    room.gameStatus = "starting";
    let count = 3;

    this.io.to(roomId).emit("countdown-tick", { count: 3 });

    room.countdownHandle = setInterval(() => {
      count -= 1;
      if (count > 0) {
        this.io.to(roomId).emit("countdown-tick", { count });
      } else if (count === 0) {
        this.io.to(roomId).emit("countdown-tick", { count: 0, text: "GO!" });
      } else {
        clearInterval(room.countdownHandle);
        room.countdownHandle = null;
        this.startQuiz(roomId);
      }
    }, 1000);
  }

  startQuiz(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameStatus = "in-progress";
    room.currentQuestionIndex = 0;
    room.hostPlayer.score = 0;
    room.hostPlayer.correctCount = 0;
    room.hostPlayer.wrongCount = 0;
    if (room.guestPlayer) {
      room.guestPlayer.score = 0;
      room.guestPlayer.correctCount = 0;
      room.guestPlayer.wrongCount = 0;
    }
    room.playerAnswers = {};

    this.io.to(roomId).emit("quiz-started", {
      totalQuestions: room.questions.length,
      timePerQuestion: room.quizSettings.timePerQuestion,
      hostPlayer: this.sanitizePlayer(room.hostPlayer),
      guestPlayer: this.sanitizePlayer(room.guestPlayer)
    });

    this.sendQuestion(roomId, 0);
  }

  sendQuestion(roomId, questionIndex) {
    const room = this.rooms.get(roomId);
    if (!room || room.gameStatus === "closed") return;

    if (questionIndex >= room.questions.length) {
      this.completeQuiz(roomId);
      return;
    }

    if (room.timerHandle) {
      clearInterval(room.timerHandle);
      room.timerHandle = null;
    }
    if (room.intermissionHandle) {
      clearTimeout(room.intermissionHandle);
      room.intermissionHandle = null;
    }

    room.currentQuestionIndex = questionIndex;
    room.gameStatus = "in-progress";
    room.questionState = {
      player1Answer: null,
      player2Answer: null,
      player1Answered: false,
      player2Answered: false,
      status: "ACTIVE"
    };
    const rawQ = room.questions[questionIndex];

    const now = Date.now();
    room.questionStartTime = now;
    room.questionEndTime = now + QUESTION_DURATION_MS;
    room.timeLeft = QUESTION_DURATION;

    const publicQuestion = {
      index: questionIndex,
      total: room.questions.length,
      category: rawQ.category,
      difficulty: rawQ.difficulty,
      question: rawQ.question,
      options: rawQ.options
    };

    this.io.to(roomId).emit("question-start", {
      question: publicQuestion,
      questionIndex,
      totalQuestions: room.questions.length,
      timeLeft: QUESTION_DURATION,
      questionStartTime: room.questionStartTime,
      questionEndTime: room.questionEndTime,
      duration: QUESTION_DURATION,
      hostPlayer: this.sanitizePlayer(room.hostPlayer),
      guestPlayer: this.sanitizePlayer(room.guestPlayer)
    });

    room.timerHandle = setInterval(() => {
      const remainingMs = room.questionEndTime - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      room.timeLeft = remainingSec;

      this.io.to(roomId).emit("timer-tick", {
        timeLeft: remainingSec,
        questionEndTime: room.questionEndTime
      });

      if (remainingSec <= 0 || Date.now() >= room.questionEndTime) {
        if (room.timerHandle) {
          clearInterval(room.timerHandle);
          room.timerHandle = null;
        }
        this.endQuestion(roomId, questionIndex, "timeout");
      }
    }, 1000);
  }

  submitAnswer({ roomId, socketId, questionIndex, answer }) {
    const room = this.rooms.get(roomId);
    if (!room || room.gameStatus !== "in-progress") return { error: "Quiz not in progress" };
    if (!room.questionState || room.questionState.status !== "ACTIVE") return { error: "Question is not active" };
    if (room.currentQuestionIndex !== questionIndex) return { error: "Question mismatch" };

    const isHost = room.hostPlayer.socketId === socketId;
    const isGuest = room.guestPlayer?.socketId === socketId;
    if (!isHost && !isGuest) return { error: "Player not found in room" };

    if (isHost) {
      if (room.questionState.player1Answered) {
        return { error: "Already answered this question" };
      }
      room.questionState.player1Answer = answer;
      room.questionState.player1Answered = true;
    } else if (isGuest) {
      if (room.questionState.player2Answered) {
        return { error: "Already answered this question" };
      }
      room.questionState.player2Answer = answer;
      room.questionState.player2Answered = true;
    }

    // Send answer-submitted event to the answering player
    this.io.to(socketId).emit("answer-submitted", {
      questionIndex,
      answer,
      answered: true
    });

    // Notify opponent that other player has submitted an answer (without revealing the choice)
    const opponentSocketId = isHost ? room.guestPlayer?.socketId : room.hostPlayer.socketId;
    if (opponentSocketId) {
      this.io.to(opponentSocketId).emit("opponent-answered-status", {
        answered: true
      });
    }

    // Check if both players have answered
    const bothAnswered = room.questionState.player1Answered && room.questionState.player2Answered;

    if (bothAnswered) {
      if (room.timerHandle) {
        clearInterval(room.timerHandle);
        room.timerHandle = null;
      }
      this.endQuestion(roomId, questionIndex, "all-answered");
    }

    return { success: true, answered: true, selectedAnswer: answer };
  }

  endQuestion(roomId, questionIndex, reason = "timeout") {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Race condition guard: only an ACTIVE question can be ended
    if (!room.questionState || room.questionState.status !== "ACTIVE") {
      return;
    }
    room.questionState.status = "ENDING";

    if (room.timerHandle) {
      clearInterval(room.timerHandle);
      room.timerHandle = null;
    }

    const currentQ = room.questions[questionIndex];
    const hostAnswer = room.questionState.player1Answer;
    const guestAnswer = room.questionState.player2Answer;

    // Evaluate Host Answer
    const isHostCorrect = hostAnswer !== null && hostAnswer === currentQ.correctAnswer;
    if (hostAnswer !== null) {
      if (isHostCorrect) {
        room.hostPlayer.score += 1;
        room.hostPlayer.correctCount += 1;
      } else {
        room.hostPlayer.wrongCount += 1;
      }
    } else {
      room.hostPlayer.wrongCount += 1;
    }

    // Evaluate Guest Answer
    let isGuestCorrect = false;
    if (room.guestPlayer) {
      isGuestCorrect = guestAnswer !== null && guestAnswer === currentQ.correctAnswer;
      if (guestAnswer !== null) {
        if (isGuestCorrect) {
          room.guestPlayer.score += 1;
          room.guestPlayer.correctCount += 1;
        } else {
          room.guestPlayer.wrongCount += 1;
        }
      } else {
        room.guestPlayer.wrongCount += 1;
      }
    }

    // Send private feedback to submitting players now that question has ended
    this.io.to(room.hostPlayer.socketId).emit("answer-feedback", {
      isCorrect: isHostCorrect,
      correctAnswer: currentQ.correctAnswer,
      explanation: currentQ.explanation,
      userScore: room.hostPlayer.score,
      selectedAnswer: hostAnswer
    });

    if (room.guestPlayer?.socketId) {
      this.io.to(room.guestPlayer.socketId).emit("answer-feedback", {
        isCorrect: isGuestCorrect,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        userScore: room.guestPlayer.score,
        selectedAnswer: guestAnswer
      });
    }

    // Broadcast question summary & updated scores to all players in the room
    this.io.to(roomId).emit("question-ended", {
      questionIndex,
      correctAnswer: currentQ.correctAnswer,
      explanation: currentQ.explanation,
      hostAnswer,
      guestAnswer,
      hostPlayer: this.sanitizePlayer(room.hostPlayer),
      guestPlayer: this.sanitizePlayer(room.guestPlayer),
      reason
    });

    room.questionState.status = "COMPLETED";
    room.gameStatus = "intermission";

    // Transition delay showing score review and feedback before advancing both players
    if (room.intermissionHandle) clearTimeout(room.intermissionHandle);
    room.intermissionHandle = setTimeout(() => {
      this.sendQuestion(roomId, questionIndex + 1);
    }, INTERMISSION_DURATION_MS);
  }

  completeQuiz(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameStatus = "completed";
    if (room.timerHandle) clearInterval(room.timerHandle);
    if (room.intermissionHandle) clearTimeout(room.intermissionHandle);
    if (room.countdownHandle) clearInterval(room.countdownHandle);

    const host = room.hostPlayer;
    const guest = room.guestPlayer;
    const totalQ = room.questions.length;

    let winner = null;
    let isDraw = false;

    if (guest) {
      if (host.score > guest.score) {
        winner = host.name;
      } else if (guest.score > host.score) {
        winner = guest.name;
      } else {
        isDraw = true;
      }
    } else {
      winner = host.name;
    }

    const hostStats = {
      ...this.sanitizePlayer(host),
      accuracy: totalQ > 0 ? Math.round((host.correctCount / totalQ) * 100) : 0,
      totalQuestions: totalQ
    };

    const guestStats = guest ? {
      ...this.sanitizePlayer(guest),
      accuracy: totalQ > 0 ? Math.round((guest.correctCount / totalQ) * 100) : 0,
      totalQuestions: totalQ
    } : null;

    this.io.to(roomId).emit("quiz-completed", {
      winner,
      isDraw,
      hostStats,
      guestStats,
      totalQuestions: totalQ
    });
  }

  restartQuiz(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.questions = getQuizQuestions(room.quizSettings.category, room.quizSettings.difficulty, room.quizSettings.questionCount);
    room.currentQuestionIndex = 0;
    room.hostPlayer.score = 0;
    room.hostPlayer.correctCount = 0;
    room.hostPlayer.wrongCount = 0;
    if (room.guestPlayer) {
      room.guestPlayer.score = 0;
      room.guestPlayer.correctCount = 0;
      room.guestPlayer.wrongCount = 0;
    }
    room.playerAnswers = {};
    room.gameStatus = "waiting";

    this.io.to(roomId).emit("quiz-reset", {
      room: this.sanitizeRoom(room)
    });
  }

  reconnectPlayer({ roomId, playerId, socketId }) {
    const room = this.getRoom(roomId);
    if (!room) return { error: "Room not found or expired." };

    let player = null;
    let role = null;

    if (room.hostPlayer && room.hostPlayer.id === playerId) {
      player = room.hostPlayer;
      role = "host";
    } else if (room.guestPlayer && room.guestPlayer.id === playerId) {
      player = room.guestPlayer;
      role = "guest";
    }

    if (!player) {
      return { error: "Player identity not recognized in this room." };
    }

    // Clear disconnect timer if active
    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

    player.socketId = socketId;
    player.connected = true;

    // Build recovery payload
    const qIndex = room.currentQuestionIndex;
    const rawQ = room.questions[qIndex];
    const currentQ = rawQ ? {
      index: qIndex,
      total: room.questions.length,
      category: rawQ.category,
      difficulty: rawQ.difficulty,
      question: rawQ.question,
      options: rawQ.options
    } : null;

    const isHost = role === "host";
    const myAnswerVal = isHost ? room.questionState?.player1Answer : room.questionState?.player2Answer;
    const opponentAnswered = isHost ? !!room.questionState?.player2Answered : !!room.questionState?.player1Answered;

    // Notify room of reconnection
    this.io.to(roomId).emit("player-reconnected", {
      role,
      name: player.name
    });

    const isIntermission = room.gameStatus === "intermission" || room.questionState?.status === "COMPLETED";

    return {
      success: true,
      role,
      room: this.sanitizeRoom(room),
      currentQuestion: currentQ,
      timeLeft: room.timeLeft,
      questionStartTime: room.questionStartTime,
      questionEndTime: room.questionEndTime,
      gameStatus: room.gameStatus,
      isIntermission,
      myAnswer: myAnswerVal ? {
        selectedAnswer: myAnswerVal,
        isCorrect: isIntermission ? (myAnswerVal === rawQ?.correctAnswer) : undefined,
        correctAnswer: isIntermission ? rawQ?.correctAnswer : undefined,
        explanation: isIntermission ? rawQ?.explanation : undefined
      } : null,
      opponentAnswered
    };
  }

  handleDisconnect(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      let disconnectedPlayer = null;

      if (room.hostPlayer?.socketId === socketId) {
        disconnectedPlayer = room.hostPlayer;
      } else if (room.guestPlayer?.socketId === socketId) {
        disconnectedPlayer = room.guestPlayer;
      }

      if (disconnectedPlayer) {
        disconnectedPlayer.connected = false;

        // If game is still in waiting room and opponent left
        if (room.gameStatus === "waiting") {
          if (disconnectedPlayer.role === "host") {
            this.io.to(roomId).emit("player-left", {
              role: "host",
              message: "Host disconnected."
            });
            this.cleanupRoom(roomId);
          } else {
            room.guestPlayer = null;
            this.io.to(roomId).emit("room-updated", { room: this.sanitizeRoom(room) });
            this.io.to(roomId).emit("player-left", {
              role: "guest",
              message: "Opponent left the room."
            });
          }
          return;
        }

        // Notify room that player temporarily disconnected
        this.io.to(roomId).emit("player-temporarily-disconnected", {
          role: disconnectedPlayer.role,
          name: disconnectedPlayer.name,
          message: `${disconnectedPlayer.name} disconnected`
        });

        // Start a 20-second grace timer for reconnection before declaring forfeiting
        if (disconnectedPlayer.disconnectTimer) clearTimeout(disconnectedPlayer.disconnectTimer);
        disconnectedPlayer.disconnectTimer = setTimeout(() => {
          if (!disconnectedPlayer.connected) {
            this.io.to(roomId).emit("player-left", {
              role: disconnectedPlayer.role,
              message: `${disconnectedPlayer.name} left the match.`
            });
            if (disconnectedPlayer.role === "host") {
              this.cleanupRoom(roomId);
            }
          }
        }, 20000);
      }
    }
  }

  leaveRoom(socketId, roomId) {
    const room = this.getRoom(roomId);
    if (!room) return;

    if (room.hostPlayer?.socketId === socketId) {
      this.io.to(roomId).emit("player-left", {
        role: "host",
        message: "Host left the room."
      });
      this.cleanupRoom(roomId);
    } else if (room.guestPlayer?.socketId === socketId) {
      room.guestPlayer = null;
      this.io.to(roomId).emit("player-left", {
        role: "guest",
        message: "Opponent left the room."
      });
      if (room.gameStatus === "waiting") {
        this.io.to(roomId).emit("room-updated", { room: this.sanitizeRoom(room) });
      }
    }
  }

  cleanupRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      if (room.timerHandle) clearInterval(room.timerHandle);
      if (room.intermissionHandle) clearTimeout(room.intermissionHandle);
      if (room.countdownHandle) clearInterval(room.countdownHandle);
      if (room.hostPlayer?.disconnectTimer) clearTimeout(room.hostPlayer.disconnectTimer);
      if (room.guestPlayer?.disconnectTimer) clearTimeout(room.guestPlayer.disconnectTimer);
      room.gameStatus = "closed";
      this.rooms.delete(roomId);
    }
  }

  sanitizePlayer(player) {
    if (!player) return null;
    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      score: player.score,
      correctCount: player.correctCount,
      wrongCount: player.wrongCount,
      role: player.role,
      connected: player.connected
    };
  }

  sanitizeRoom(room) {
    if (!room) return null;
    return {
      roomId: room.roomId,
      hostPlayer: this.sanitizePlayer(room.hostPlayer),
      guestPlayer: this.sanitizePlayer(room.guestPlayer),
      quizSettings: room.quizSettings,
      gameStatus: room.gameStatus,
      currentQuestionIndex: room.currentQuestionIndex,
      totalQuestions: room.questions.length
    };
  }
}
