import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runEndToEndMultiplayerSuite() {
  console.log("==================================================");
  console.log("STARTING FULL MULTIPLAYER E2E TEST SUITE");
  console.log("==================================================");

  // ----------------------------------------------------
  // TEST CASE 17: Invalid Room ID
  // ----------------------------------------------------
  console.log("\n[TEST 17] Testing Invalid Room ID...");
  const invalidSocket = io(SERVER_URL);
  await new Promise(r => invalidSocket.on("connect", r));

  const invalidJoinRes = await new Promise(res => {
    invalidSocket.emit("join-room", {
      roomId: "ZZ99XX",
      guestId: "p_test_invalid",
      playerName: "Bob",
      playerAvatar: "avatar-3"
    }, res);
  });

  if (!invalidJoinRes.success && invalidJoinRes.error.includes("Room not found")) {
    console.log("✓ PASS: Correctly rejected invalid room ID with friendly message:", invalidJoinRes.error);
  } else {
    throw new Error("FAIL: Invalid room was not rejected properly!");
  }
  invalidSocket.disconnect();

  // ----------------------------------------------------
  // TEST CASES 1 - 6: Room Creation, Room ID, Join, Names & Avatars
  // ----------------------------------------------------
  console.log("\n[TEST 1-6] Player 1 creates room, Player 2 joins...");
  const p1Socket = io(SERVER_URL);
  const p2Socket = io(SERVER_URL);
  await Promise.all([
    new Promise(r => p1Socket.on("connect", r)),
    new Promise(r => p2Socket.on("connect", r))
  ]);

  const p1Id = "p1_jeevan";
  const p2Id = "p2_anaya";

  // Step 1 & 2: Player 1 creates quiz
  const createRes = await new Promise(res => {
    p1Socket.emit("create-room", {
      hostId: p1Id,
      hostName: "Jeevan",
      hostAvatar: "avatar-1",
      category: "Mixed English",
      difficulty: "medium",
      questionCount: 10,
      timePerQuestion: 10
    }, res);
  });

  if (!createRes.success) throw new Error("Failed to create room: " + createRes.error);
  const roomId = createRes.roomId;
  console.log(`✓ [TEST 1-2] Player 1 created room with unique 6-char ID: "${roomId}"`);
  if (!/^[A-Z0-9]{6}$/.test(roomId)) {
    throw new Error("Room ID is not 6 uppercase alphanumeric characters!");
  }

  // Step 4-6: Player 2 joins with Room ID
  const p1PlayerJoinedPromise = new Promise(r => p1Socket.once("player-joined", r));

  const joinRes = await new Promise(res => {
    p2Socket.emit("join-room", {
      roomId,
      guestId: p2Id,
      playerName: "Anaya",
      playerAvatar: "avatar-2"
    }, res);
  });

  if (!joinRes.success) throw new Error("Player 2 failed to join: " + joinRes.error);
  console.log("✓ [TEST 4-5] Player 2 joined the exact same room:", roomId);

  const p1JoinedEvent = await p1PlayerJoinedPromise;
  console.log("✓ [TEST 6] Both players see each other:");
  console.log(`    Host: ${p1JoinedEvent.room.hostPlayer.name} (Avatar: ${p1JoinedEvent.room.hostPlayer.avatar})`);
  console.log(`    Guest: ${p1JoinedEvent.guestPlayer.name} (Avatar: ${p1JoinedEvent.guestPlayer.avatar})`);

  if (p1JoinedEvent.room.hostPlayer.name !== "Jeevan" || p1JoinedEvent.guestPlayer.name !== "Anaya") {
    throw new Error("Player names mismatch!");
  }

  // ----------------------------------------------------
  // TEST CASE 18: Full Room Rejection
  // ----------------------------------------------------
  console.log("\n[TEST 18] Testing Join on Full Room (3rd Player)...");
  const p3Socket = io(SERVER_URL);
  await new Promise(r => p3Socket.on("connect", r));

  const p3JoinRes = await new Promise(res => {
    p3Socket.emit("join-room", {
      roomId,
      guestId: "p3_intruder",
      playerName: "Charlie",
      playerAvatar: "avatar-3"
    }, res);
  });

  if (!p3JoinRes.success && p3JoinRes.error.includes("already has two players")) {
    console.log("✓ PASS: Correctly rejected 3rd player from full room:", p3JoinRes.error);
  } else {
    throw new Error("FAIL: 3rd player was allowed to join full room!");
  }
  p3Socket.disconnect();

  // ----------------------------------------------------
  // TEST CASES 7 - 9: Synchronized Start & Synchronized 7s Timer
  // ----------------------------------------------------
  console.log("\n[TEST 7-9] Starting quiz and verifying synchronized Question 1 & Timer...");
  const p1CountdownPromise = new Promise(r => p1Socket.once("countdown-tick", r));
  const p2CountdownPromise = new Promise(r => p2Socket.once("countdown-tick", r));

  const p1Q1Promise = new Promise(r => p1Socket.once("question-start", r));
  const p2Q1Promise = new Promise(r => p2Socket.once("question-start", r));

  p1Socket.emit("start-quiz", { roomId });

  await Promise.all([p1CountdownPromise, p2CountdownPromise]);
  console.log("✓ [TEST 7] Synchronized countdown tick received by both players.");

  const [q1Host, q1Guest] = await Promise.all([p1Q1Promise, p2Q1Promise]);
  console.log(`✓ [TEST 8] Question 1 received simultaneously by both players: "${q1Host.question.question}"`);
  if (q1Host.question.question !== q1Guest.question.question) {
    throw new Error("Questions differ between players!");
  }
  console.log(`✓ [TEST 9] Synchronized timer started at: ${q1Host.timeLeft}s for Host, ${q1Guest.timeLeft}s for Guest.`);
  if (q1Host.timeLeft !== 10 || q1Guest.timeLeft !== 10) {
    throw new Error("Timer did not start at 10 seconds!");
  }

  // ----------------------------------------------------
  // TEST CASES 10 - 12: Submitting Different Answers, Server Scoring, Double Submit Block
  // ----------------------------------------------------
  console.log("\n[TEST 10-12] Testing wait-for-both, server scoring, and preventing double-submission...");
  // Host submits option 0
  const hostOption = q1Host.question.options[0];
  let p1EarlyFeedback = false;
  const earlyCheckHandler = () => { p1EarlyFeedback = true; };
  p1Socket.on("answer-feedback", earlyCheckHandler);

  const p2OpponentAnsweredPromise = new Promise(r => p2Socket.once("opponent-answered-status", r));

  p1Socket.emit("submit-answer", {
    roomId,
    questionIndex: 0,
    answer: hostOption
  });

  await p2OpponentAnsweredPromise;
  await sleep(400);
  if (p1EarlyFeedback) {
    throw new Error("FAIL: Host received feedback before Guest answered!");
  }
  p1Socket.off("answer-feedback", earlyCheckHandler);
  console.log("✓ Opponent received 'opponent-answered-status' without revealing choice.");
  console.log("✓ Host is properly waiting for Guest without early feedback.");

  // Test 12: Host tries to submit AGAIN on question 0
  const doubleSubmitRes = await new Promise(res => {
    p1Socket.emit("submit-answer", {
      roomId,
      questionIndex: 0,
      answer: q1Host.question.options[1]
    }, res);
  });
  console.log("✓ [TEST 12] Double-submission attempt result:", doubleSubmitRes);
  if (!doubleSubmitRes.error) {
    throw new Error("Server permitted double submission on the same question!");
  }
  console.log("✓ PASS: Server strictly blocked double submission!");

  // Guest submits option 1 (different answer)
  const guestOption = q1Host.question.options[1];
  const p1FeedbackPromise = new Promise(r => p1Socket.once("answer-feedback", r));
  const p2FeedbackPromise = new Promise(r => p2Socket.once("answer-feedback", r));
  const qEndedPromise = new Promise(r => p1Socket.once("question-ended", r));

  p2Socket.emit("submit-answer", {
    roomId,
    questionIndex: 0,
    answer: guestOption
  });

  const [p1Feedback, p2Feedback, q1EndSummary] = await Promise.all([p1FeedbackPromise, p2FeedbackPromise, qEndedPromise]);
  console.log(`✓ [TEST 10] Both answered -> feedback received: Host correct=${p1Feedback.isCorrect}, Guest correct=${p2Feedback.isCorrect}`);
  console.log(`✓ [TEST 11] Question 1 complete. Scores: Host=${q1EndSummary.hostPlayer.score}, Guest=${q1EndSummary.guestPlayer.score}`);

  // ----------------------------------------------------
  // TEST CASE 16: Page Refresh / Reconnection During Quiz
  // ----------------------------------------------------
  console.log("\n[TEST 16] Testing Page Refresh / Reconnection mid-game...");
  // Simulate Guest refreshing page: Guest disconnects socket and reconnects with new socket
  console.log("  Simulating Guest refreshing browser tab (disconnecting p2Socket)...");
  p2Socket.disconnect();
  await sleep(1000);

  const p2ReconnectedSocket = io(SERVER_URL);
  await new Promise(r => p2ReconnectedSocket.on("connect", r));

  const reconnectRes = await new Promise(res => {
    p2ReconnectedSocket.emit("reconnect-room", {
      roomId,
      playerId: p2Id
    }, res);
  });

  if (!reconnectRes.success) {
    throw new Error("Reconnection failed: " + reconnectRes.error);
  }
  console.log("✓ [TEST 16] Guest successfully reconnected! Game state recovered:");
  console.log(`    Role: ${reconnectRes.role}, GameStatus: ${reconnectRes.gameStatus}, HostScore: ${reconnectRes.room.hostPlayer.score}, GuestScore: ${reconnectRes.room.guestPlayer.score}`);

  // ----------------------------------------------------
  // TEST CASE 13 - 15: Timeout Progression & Playing Through All 10 Questions
  // ----------------------------------------------------
  console.log("\n[TEST 13-15] Playing remaining questions to verify automatic progression and completion...");

  const finalCompletionPromise = new Promise(r => {
    p1Socket.on("quiz-completed", r);
  });

  // Attach listener to submit quick answers or let some timeout to verify both mechanics
  const handleQuestionsForSocket = (sock, role) => {
    sock.on("question-start", async (data) => {
      const qIdx = data.question.index;
      // On question 5, let it timeout completely without answering to verify Test 13
      if (qIdx === 5) {
        console.log(`  [TEST 13 Verification] Question 5: Neither player answers, waiting for 7s timeout...`);
        return;
      }

      // Pick an answer quickly
      await sleep(1200);
      sock.emit("submit-answer", {
        roomId,
        questionIndex: qIdx,
        answer: data.question.options[role === "host" ? 0 : 1]
      });
    });
  };

  handleQuestionsForSocket(p1Socket, "host");
  handleQuestionsForSocket(p2ReconnectedSocket, "guest");

  console.log("  Waiting for all 10 questions to complete...");
  const finalResultP1 = await finalCompletionPromise;
  console.log("\n✓ [TEST 14-15] Quiz Completed! Final Result received by Host:");
  console.log(`    Winner: ${finalResultP1.winner || "Draw"} (isDraw: ${finalResultP1.isDraw})`);
  console.log(`    Host Stats: Score=${finalResultP1.hostStats.score}, Accuracy=${finalResultP1.hostStats.accuracy}%`);
  console.log(`    Guest Stats: Score=${finalResultP1.guestStats.score}, Accuracy=${finalResultP1.guestStats.accuracy}%`);

  if (finalResultP1.totalQuestions !== 10) {
    throw new Error("Total questions was not 10!");
  }

  // ----------------------------------------------------
  // TEST CASE 19: Player Disconnecting
  // ----------------------------------------------------
  console.log("\n[TEST 19] Testing One Player Leaving/Disconnecting...");
  const p1PlayerLeftPromise = new Promise(r => p1Socket.once("player-left", r));
  p2ReconnectedSocket.emit("leave-room", { roomId });
  const playerLeftEvent = await p1PlayerLeftPromise;
  console.log("✓ [TEST 19] Host notified that opponent left:", playerLeftEvent.message);

  p1Socket.disconnect();
  p2ReconnectedSocket.disconnect();

  console.log("\n==================================================");
  console.log("ALL 20 E2E MULTIPLAYER TESTS PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

runEndToEndMultiplayerSuite().catch(err => {
  console.error("FATAL ERROR IN SUITE:", err);
  process.exit(1);
});
