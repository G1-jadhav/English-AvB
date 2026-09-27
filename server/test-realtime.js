import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

async function testRealtimeMultiplayer() {
  console.log("=== Testing Real-Time Multiplayer Socket.IO ===");

  const socket1 = io(SERVER_URL);
  const socket2 = io(SERVER_URL);

  await new Promise(r => socket1.on("connect", r));
  await new Promise(r => socket2.on("connect", r));
  console.log("✓ Both player sockets connected to server.");

  // 1. Host creates room
  const createRes = await new Promise((resolve) => {
    socket1.emit("create-room", {
      hostName: "Jeevan",
      hostAvatar: "avatar-1",
      category: "Grammar",
      difficulty: "medium",
      questionCount: 10,
      timePerQuestion: 10
    }, resolve);
  });

  if (!createRes.success) {
    throw new Error("Create room failed: " + createRes.error);
  }
  const roomId = createRes.roomId;
  console.log(`✓ Room created with unique ID: ${roomId}`);

  // 2. Guest joins room
  const guestJoinedPromise = new Promise((resolve) => {
    socket1.on("player-joined", (data) => {
      console.log(`✓ Host received 'player-joined': ${data.guestPlayer.name}`);
      resolve(data);
    });
  });

  const joinRes = await new Promise((resolve) => {
    socket2.emit("join-room", {
      roomId,
      playerName: "Anaya",
      playerAvatar: "avatar-2"
    }, resolve);
  });

  if (!joinRes.success) {
    throw new Error("Join room failed: " + joinRes.error);
  }
  console.log(`✓ Guest 'Anaya' successfully joined Room ${roomId}`);
  await guestJoinedPromise;

  // 3. Host starts quiz
  const qStart1Promise = new Promise(r => socket1.on("question-start", r));
  const qStart2Promise = new Promise(r => socket2.on("question-start", r));

  console.log("✓ Host starting quiz...");
  socket1.emit("start-quiz", { roomId });

  const [q1, q2] = await Promise.all([qStart1Promise, qStart2Promise]);
  console.log(`✓ Both players received Question 1: "${q1.question.question}"`);
  if (q1.question.question !== q2.question.question) {
    throw new Error("Questions do not match between players!");
  }
  if (q1.timeLeft !== 10 || q2.timeLeft !== 10) {
    throw new Error(`Expected 10s timer, got: p1=${q1.timeLeft}s, p2=${q2.timeLeft}s`);
  }
  console.log("✓ Both players received the exact same synchronized 10s question!");

  // 4. Submit answers - socket1 answers first
  let feedbackReceivedEarly = false;
  const earlyFeedbackHandler = () => { feedbackReceivedEarly = true; };
  socket1.on("answer-feedback", earlyFeedbackHandler);

  const p1AnswerRes = await new Promise((resolve) => {
    socket1.emit("submit-answer", {
      roomId,
      questionIndex: 0,
      answer: q1.question.options[0]
    }, resolve);
  });
  console.log("✓ Player 1 submitted answer successfully:", p1AnswerRes);

  // Wait 600ms and verify Player 1 has NOT received answer-feedback yet
  await new Promise(r => setTimeout(r, 600));
  if (feedbackReceivedEarly) {
    throw new Error("FAIL: Player 1 received answer-feedback before Player 2 answered!");
  }
  socket1.off("answer-feedback", earlyFeedbackHandler);
  console.log("✓ Player 1 is waiting for opponent (question stayed on Q1, no early feedback revealed).");

  // Now Player 2 submits answer
  const feedbackP1Promise = new Promise(r => socket1.once("answer-feedback", r));
  const feedbackP2Promise = new Promise(r => socket2.once("answer-feedback", r));
  const qEndedPromise = new Promise(r => socket1.once("question-ended", r));

  socket2.emit("submit-answer", {
    roomId,
    questionIndex: 0,
    answer: q2.question.options[1]
  });

  const [fb1, fb2, qEnded] = await Promise.all([feedbackP1Promise, feedbackP2Promise, qEndedPromise]);
  console.log(`✓ Both players received feedback after both answered! Correct: "${qEnded.correctAnswer}"`);
  console.log(`✓ P1 score: ${fb1.userScore}, P2 score: ${fb2.userScore}`);

  socket1.disconnect();
  socket2.disconnect();
  console.log("=== All Real-Time Multiplayer Tests PASSED Successfully! ===");
}

testRealtimeMultiplayer().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
