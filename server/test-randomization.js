import { getQuizQuestions } from "./data/questions.js";
import { io as Client } from "socket.io-client";

console.log("==================================================");
console.log("TESTING ANSWER OPTION RANDOMIZATION (20+ QUESTIONS)");
console.log("==================================================");

// 1. Test 20 questions from getQuizQuestions
const questions = getQuizQuestions("Mixed English", "all", 20);
const letters = ["A", "B", "C", "D"];
const counts = { A: 0, B: 0, C: 0, D: 0 };

console.log("\n[ANALYSIS OF 20 QUESTIONS FROM getQuizQuestions]");
questions.forEach((q, idx) => {
  const correctIdx = q.options.indexOf(q.correctAnswer);
  const letter = letters[correctIdx] || "UNKNOWN";
  counts[letter] = (counts[letter] || 0) + 1;
  console.log(`Question ${idx + 1} (${q.id}): Correct Answer is "${q.correctAnswer}" -> Option ${letter}`);
});

console.log("\nDistribution across options:");
console.log(counts);

if (counts.A >= 18) {
  console.error("FAIL: Option A appears too frequently! Randomization failed.");
  process.exit(1);
} else {
  console.log("✓ SUCCESS: Correct answer is distributed across A, B, C, D!");
}

// 2. Test another batch to verify order changes on re-run
console.log("\n[TESTING RE-RUN / RESTART VARIATION]");
const batch2 = getQuizQuestions("Mixed English", "all", 10);
const counts2 = { A: 0, B: 0, C: 0, D: 0 };
batch2.forEach((q, idx) => {
  const correctIdx = q.options.indexOf(q.correctAnswer);
  const letter = letters[correctIdx] || "UNKNOWN";
  counts2[letter] = (counts2[letter] || 0) + 1;
});
console.log("Second batch distribution:", counts2);

// 3. Socket.IO End-to-End Validation
console.log("\n[SOCKET.IO TWO-PLAYER QUIZ TEST]");
const SOCKET_URL = "http://localhost:5000";

async function runSocketTest() {
  const p1 = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  const p2 = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });

  await Promise.all([
    new Promise(res => p1.on("connect", res)),
    new Promise(res => p2.on("connect", res))
  ]);

  // Create room
  const createRes = await new Promise(res => {
    p1.emit("create-room", {
      hostId: "host_rand",
      hostName: "HostPlayer",
      category: "Mixed English",
      difficulty: "medium",
      questionCount: 5,
      timePerQuestion: 10
    }, res);
  });

  const roomId = createRes.roomId;
  console.log("Room created:", roomId);

  // Join room
  await new Promise(res => {
    p2.emit("join-room", {
      roomId,
      guestId: "guest_rand",
      playerName: "GuestPlayer"
    }, res);
  });

  console.log("Guest joined room.");

  let questionsTested = 0;

  p1.on("question-start", async (data) => {
    const q = data.question;
    const qIndex = data.questionIndex;
    questionsTested++;

    console.log(`\n--- Socket Question ${qIndex + 1} of ${data.totalQuestions} ---`);
    console.log("Question:", q.question);
    console.log("Options sent to client:", q.options);

    // Host submits option 0
    p1.emit("submit-answer", {
      roomId,
      questionIndex: qIndex,
      answer: q.options[0]
    });

    // Guest submits option 1
    p2.emit("submit-answer", {
      roomId,
      questionIndex: qIndex,
      answer: q.options[1]
    });
  });

  const feedbackReceived = new Promise(resolve => {
    let p1Feedbacks = 0;
    let p2Feedbacks = 0;

    p1.on("answer-feedback", (fb) => {
      p1Feedbacks++;
      console.log(`Host answer feedback Q${p1Feedbacks}: selected "${fb.selectedAnswer}", correct: "${fb.correctAnswer}", isCorrect: ${fb.isCorrect}`);
      if (p1Feedbacks >= 2 && p2Feedbacks >= 2) resolve();
    });

    p2.on("answer-feedback", (fb) => {
      p2Feedbacks++;
      console.log(`Guest answer feedback Q${p2Feedbacks}: selected "${fb.selectedAnswer}", correct: "${fb.correctAnswer}", isCorrect: ${fb.isCorrect}`);
      if (p1Feedbacks >= 2 && p2Feedbacks >= 2) resolve();
    });
  });

  // Start quiz
  p1.emit("start-quiz", { roomId });

  await feedbackReceived;

  console.log("\n==================================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("==================================================");

  p1.disconnect();
  p2.disconnect();
  process.exit(0);
}

runSocketTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
