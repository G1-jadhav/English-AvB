import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING USER-SPECIFIED TEST SUITE (TESTS 1 to 6)");
  console.log("==================================================");

  // ----------------------------------------------------
  // TEST 1 & TEST 2:
  // G1 answers after 2s -> stays on Q1.
  // SAP answers after 5s -> both finish Q1, both receive feedback, both move to Q2.
  // ----------------------------------------------------
  console.log("\n[TEST 1 & 2] G1 answers after 2s, SAP answers after 5s...");
  const sG1 = io(SERVER_URL);
  const sSAP = io(SERVER_URL);

  await Promise.all([
    new Promise(r => sG1.on("connect", r)),
    new Promise(r => sSAP.on("connect", r))
  ]);

  // Create room
  const createRes = await new Promise(res => {
    sG1.emit("create-room", {
      hostId: "g1_id",
      hostName: "G1",
      hostAvatar: "avatar-1",
      category: "Mixed English",
      difficulty: "medium",
      questionCount: 10,
      timePerQuestion: 10
    }, res);
  });
  const roomId = createRes.roomId;

  // SAP joins
  await new Promise(res => {
    sSAP.emit("join-room", {
      roomId,
      guestId: "sap_id",
      playerName: "SAP",
      playerAvatar: "avatar-2"
    }, res);
  });

  // Start Quiz
  const q1G1Promise = new Promise(r => sG1.once("question-start", r));
  const q1SAPPromise = new Promise(r => sSAP.once("question-start", r));
  sG1.emit("start-quiz", { roomId });

  const [q1G1, q1SAP] = await Promise.all([q1G1Promise, q1SAPPromise]);
  console.log(`✓ Both players on Question 1 (Index 0). Duration: ${q1G1.timeLeft}s.`);
  if (q1G1.timeLeft !== 10) throw new Error(`Expected 10s timer, got ${q1G1.timeLeft}s`);

  // Track if either player moves prematurely to Question 2
  let earlyMoveDetected = false;
  const earlyQ2Handler = () => { earlyMoveDetected = true; };
  sG1.on("question-start", earlyQ2Handler);
  sSAP.on("question-start", earlyQ2Handler);

  let g1EarlyFeedback = false;
  const earlyFBHandler = () => { g1EarlyFeedback = true; };
  sG1.on("answer-feedback", earlyFBHandler);

  // G1 answers after 2 seconds
  await sleep(2000);
  const g1SubmitRes = await new Promise(res => {
    sG1.emit("submit-answer", {
      roomId,
      questionIndex: 0,
      answer: q1G1.question.options[0]
    }, res);
  });
  console.log("✓ G1 submitted answer at 2s:", g1SubmitRes);

  // Check state after G1 submits: G1 stays on Q1, SAP stays on Q1
  await sleep(1000);
  if (earlyMoveDetected) {
    throw new Error("FAIL: Player moved to next question when only G1 answered!");
  }
  if (g1EarlyFeedback) {
    throw new Error("FAIL: G1 received answer feedback before SAP answered!");
  }
  console.log("✓ [TEST 1 PASS] G1 stays on Question 1, SAP stays on Question 1, no premature feedback.");

  // Remove early listeners
  sG1.off("question-start", earlyQ2Handler);
  sSAP.off("question-start", earlyQ2Handler);
  sG1.off("answer-feedback", earlyFBHandler);

  // TEST 2: SAP answers after 5s total (2s + 1s + 2s sleep)
  await sleep(2000);
  const g1FBPromise = new Promise(r => sG1.once("answer-feedback", r));
  const sapFBPromise = new Promise(r => sSAP.once("answer-feedback", r));
  const qEndedPromise = new Promise(r => sG1.once("question-ended", r));
  const q2G1Promise = new Promise(r => sG1.once("question-start", r));
  const q2SAPPromise = new Promise(r => sSAP.once("question-start", r));

  sSAP.emit("submit-answer", {
    roomId,
    questionIndex: 0,
    answer: q1SAP.question.options[1]
  });

  const [fbG1, fbSAP, qEnded] = await Promise.all([g1FBPromise, sapFBPromise, qEndedPromise]);
  console.log(`✓ Both players received feedback! Correct: "${qEnded.correctAnswer}"`);
  console.log(`  G1 score: ${fbG1.userScore}, SAP score: ${fbSAP.userScore}`);

  // Now verify both move to Question 2 together
  const [q2G1, q2SAP] = await Promise.all([q2G1Promise, q2SAPPromise]);
  console.log(`✓ [TEST 2 PASS] Both players moved to Question 2 (Index ${q2G1.questionIndex}). Timer reset to ${q2G1.timeLeft}s.`);
  if (q2G1.questionIndex !== 1 || q2SAP.questionIndex !== 1) {
    throw new Error("Players are not on Question 2!");
  }

  sG1.disconnect();
  sSAP.disconnect();

  // ----------------------------------------------------
  // TEST 3: G1 answers, SAP does not answer -> wait until 0s -> Question ends at 0s
  // ----------------------------------------------------
  console.log("\n[TEST 3] G1 answers, SAP does NOT answer -> timer reaches 0 -> question ends...");
  const t3G1 = io(SERVER_URL);
  const t3SAP = io(SERVER_URL);
  await Promise.all([
    new Promise(r => t3G1.on("connect", r)),
    new Promise(r => t3SAP.on("connect", r))
  ]);

  const t3RoomRes = await new Promise(res => {
    t3G1.emit("create-room", {
      hostId: "g1_id_3",
      hostName: "G1",
      timePerQuestion: 10
    }, res);
  });
  const r3Id = t3RoomRes.roomId;

  await new Promise(res => {
    t3SAP.emit("join-room", {
      roomId: r3Id,
      guestId: "sap_id_3",
      playerName: "SAP"
    }, res);
  });

  const t3Q1StartPromise = new Promise(r => t3G1.once("question-start", r));
  t3G1.emit("start-quiz", { roomId: r3Id });
  const t3Q1 = await t3Q1StartPromise;

  // G1 answers at 2s
  await sleep(2000);
  t3G1.emit("submit-answer", {
    roomId: r3Id,
    questionIndex: 0,
    answer: t3Q1.question.options[0]
  });
  console.log("✓ G1 answered. SAP will NOT answer.");

  // G1 waits while timer continues to 0
  const t3QEndedPromise = new Promise(r => t3G1.once("question-ended", r));
  const t3Q2Promise = new Promise(r => t3G1.once("question-start", r));

  const startWait = Date.now();
  const t3EndedData = await t3QEndedPromise;
  const elapsedSec = (Date.now() - startWait) / 1000;
  console.log(`✓ Question ended due to reason: "${t3EndedData.reason}" after ${elapsedSec.toFixed(1)}s.`);
  if (t3EndedData.reason !== "timeout") {
    throw new Error(`Expected timeout reason, got: ${t3EndedData.reason}`);
  }
  if (t3EndedData.guestAnswer !== null) {
    throw new Error(`Expected SAP answer to be null (No Answer), got: ${t3EndedData.guestAnswer}`);
  }

  const t3Q2 = await t3Q2Promise;
  console.log(`✓ [TEST 3 PASS] After timeout, both move to Question 2 (Index ${t3Q2.questionIndex}).`);

  t3G1.disconnect();
  t3SAP.disconnect();

  // ----------------------------------------------------
  // TEST 4: Check every question -> 10 seconds for all 10 questions
  // ----------------------------------------------------
  console.log("\n[TEST 4] Check every question duration = 10s for all 10 questions...");
  const t4G1 = io(SERVER_URL);
  const t4SAP = io(SERVER_URL);
  await Promise.all([
    new Promise(r => t4G1.on("connect", r)),
    new Promise(r => t4SAP.on("connect", r))
  ]);

  const t4RoomRes = await new Promise(res => {
    t4G1.emit("create-room", {
      hostId: "g1_id_4",
      hostName: "G1",
      questionCount: 10,
      timePerQuestion: 10
    }, res);
  });
  const r4Id = t4RoomRes.roomId;

  await new Promise(res => {
    t4SAP.emit("join-room", {
      roomId: r4Id,
      guestId: "sap_id_4",
      playerName: "SAP"
    }, res);
  });

  const questionDurations = [];
  const allQsPromise = new Promise((resolve) => {
    t4G1.on("question-start", (data) => {
      questionDurations.push({ index: data.questionIndex, timeLeft: data.timeLeft });
      console.log(`  Question ${data.questionIndex + 1} of 10 started with timer: ${data.timeLeft}s`);

      // Both answer immediately to move fast
      t4G1.emit("submit-answer", { roomId: r4Id, questionIndex: data.questionIndex, answer: data.question.options[0] });
      t4SAP.emit("submit-answer", { roomId: r4Id, questionIndex: data.questionIndex, answer: data.question.options[0] });
    });

    t4G1.on("quiz-completed", resolve);
  });

  t4G1.emit("start-quiz", { roomId: r4Id });
  await allQsPromise;

  if (questionDurations.length !== 10) {
    throw new Error(`Expected 10 questions, recorded: ${questionDurations.length}`);
  }
  for (const q of questionDurations) {
    if (q.timeLeft !== 10) {
      throw new Error(`Question ${q.index + 1} did not have 10 seconds! Got: ${q.timeLeft}s`);
    }
  }
  console.log("✓ [TEST 4 PASS] All 10 questions started with exactly 10s duration!");

  t4G1.disconnect();
  t4SAP.disconnect();

  // ----------------------------------------------------
  // TEST 5: Simultaneous Answers Race Condition
  // ----------------------------------------------------
  console.log("\n[TEST 5] Testing almost simultaneous answers race condition...");
  const t5G1 = io(SERVER_URL);
  const t5SAP = io(SERVER_URL);
  await Promise.all([
    new Promise(r => t5G1.on("connect", r)),
    new Promise(r => t5SAP.on("connect", r))
  ]);

  const t5RoomRes = await new Promise(res => {
    t5G1.emit("create-room", { hostId: "g1_id_5", hostName: "G1", timePerQuestion: 10 }, res);
  });
  const r5Id = t5RoomRes.roomId;
  await new Promise(res => {
    t5SAP.emit("join-room", { roomId: r5Id, guestId: "sap_id_5", playerName: "SAP" }, res);
  });

  const t5Q1Promise = new Promise(r => t5G1.once("question-start", r));
  t5G1.emit("start-quiz", { roomId: r5Id });
  const t5Q1 = await t5Q1Promise;

  let qEndedCount = 0;
  t5G1.on("question-ended", () => { qEndedCount++; });

  let nextQCount = 0;
  t5G1.on("question-start", (data) => {
    if (data.questionIndex === 1) nextQCount++;
  });

  // Both submit simultaneously
  await Promise.all([
    new Promise(r => t5G1.emit("submit-answer", { roomId: r5Id, questionIndex: 0, answer: t5Q1.question.options[0] }, r)),
    new Promise(r => t5SAP.emit("submit-answer", { roomId: r5Id, questionIndex: 0, answer: t5Q1.question.options[1] }, r))
  ]);

  // Wait 3.5 seconds for intermission to complete
  await sleep(3500);

  if (qEndedCount !== 1) {
    throw new Error(`Expected exactly 1 question-ended event, received: ${qEndedCount}`);
  }
  if (nextQCount !== 1) {
    throw new Error(`Expected exactly 1 next-question event, received: ${nextQCount}`);
  }
  console.log("✓ [TEST 5 PASS] Exactly 1 question-ended event and 1 next-question event on simultaneous submissions!");

  t5G1.disconnect();
  t5SAP.disconnect();

  // ----------------------------------------------------
  // TEST 6: Try answering twice
  // ----------------------------------------------------
  console.log("\n[TEST 6] Testing duplicate answer rejection...");
  const t6G1 = io(SERVER_URL);
  const t6SAP = io(SERVER_URL);
  await Promise.all([
    new Promise(r => t6G1.on("connect", r)),
    new Promise(r => t6SAP.on("connect", r))
  ]);

  const t6RoomRes = await new Promise(res => {
    t6G1.emit("create-room", { hostId: "g1_id_6", hostName: "G1", timePerQuestion: 10 }, res);
  });
  const r6Id = t6RoomRes.roomId;
  await new Promise(res => {
    t6SAP.emit("join-room", { roomId: r6Id, guestId: "sap_id_6", playerName: "SAP" }, res);
  });

  const t6Q1Promise = new Promise(r => t6G1.once("question-start", r));
  t6G1.emit("start-quiz", { roomId: r6Id });
  const t6Q1 = await t6Q1Promise;

  // G1 answers once with option 0
  const firstAnswerRes = await new Promise(res => {
    t6G1.emit("submit-answer", {
      roomId: r6Id,
      questionIndex: 0,
      answer: t6Q1.question.options[0]
    }, res);
  });
  console.log("✓ First answer submitted:", firstAnswerRes);
  if (!firstAnswerRes.success) throw new Error("First answer failed!");

  // G1 tries answering again with option 1
  const secondAnswerRes = await new Promise(res => {
    t6G1.emit("submit-answer", {
      roomId: r6Id,
      questionIndex: 0,
      answer: t6Q1.question.options[1]
    }, res);
  });
  console.log("✓ Second answer attempt result:", secondAnswerRes);
  if (!secondAnswerRes.error) {
    throw new Error("FAIL: Server allowed second answer submission!");
  }
  console.log("✓ [TEST 6 PASS] Second answer was rejected, only first answer accepted!");

  t6G1.disconnect();
  t6SAP.disconnect();

  console.log("\n==================================================");
  console.log("ALL TESTS 1 - 6 COMPLETED AND PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
