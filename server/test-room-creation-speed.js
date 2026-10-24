import { io as Client } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

async function runTests() {
  console.log("==================================================================");
  console.log("RUNNING VERIFICATION TEST SUITE: ROOM CREATION & PERFORMANCE");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Creating a room when backend is already connected (Measure Speed)
  console.log("\n--- TEST 1: Room creation speed when connected ---");
  const s1 = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  await new Promise(r => s1.on("connect", r));

  const tStart = Date.now();
  const res1 = await new Promise(resolve => {
    s1.emit("create-room", {
      hostId: "host_speed_1",
      hostName: "FlashHost",
      category: "Grammar",
      difficulty: "medium",
      questionCount: 10,
      timePerQuestion: 10
    }, resolve);
  });
  const duration = Date.now() - tStart;

  assert(res1 && res1.success === true, "Room creation succeeded");
  assert(typeof res1.roomId === "string" && res1.roomId.length === 6, `Generated valid 6-char room ID: ${res1?.roomId}`);
  assert(res1.room && res1.room.totalQuestions === 10, "Room has exactly 10 questions");
  assert(res1.room && res1.room.quizSettings.category === "Grammar", "Preserved category selection");
  assert(duration < 200, `Room creation is ultra-fast: ${duration}ms (sub-200ms)`);
  console.log(`Speed: ${duration}ms for room creation!`);

  // TEST 2: Creating a room immediately upon socket opening (connection readiness)
  console.log("\n--- TEST 2: Immediate room creation upon opening socket ---");
  const s2 = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  // Emit before waiting for 'connect' event explicitly (testing socket.io connection pipeline)
  const tStart2 = Date.now();
  const res2 = await new Promise(resolve => {
    s2.emit("create-room", {
      hostId: "host_speed_2",
      hostName: "InstantHost",
      category: "Vocabulary",
      difficulty: "hard",
      questionCount: 10,
      timePerQuestion: 10
    }, resolve);
  });
  const duration2 = Date.now() - tStart2;
  assert(res2 && res2.success === true, "Immediate room creation succeeded");
  assert(res2.room && res2.room.quizSettings.category === "Vocabulary", "Vocabulary category loaded");
  assert(duration2 < 1000, `Instant connection + creation took: ${duration2}ms`);

  // TEST 3: Creating a room when socket reconnects
  console.log("\n--- TEST 3: Room creation on socket reconnect ---");
  s2.disconnect();
  s2.connect();
  await new Promise(r => s2.on("connect", r));
  const res3 = await new Promise(resolve => {
    s2.emit("create-room", {
      hostId: "host_speed_3",
      hostName: "ReconnectHost",
      category: "Mixed English",
      difficulty: "easy",
      questionCount: 10
    }, resolve);
  });
  assert(res3 && res3.success === true, "Creation on reconnected socket succeeded");
  assert(res3.room && res3.room.totalQuestions === 10, "10 questions loaded on reconnect");

  // TEST 4: Rapid multiple clicks (Duplicate prevention & safety)
  console.log("\n--- TEST 4: Rapid multiple create-room requests ---");
  const s4 = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  await new Promise(r => s4.on("connect", r));

  // Send 3 requests almost simultaneously from same socket
  const promises = [
    new Promise(r => s4.emit("create-room", { hostId: "h4", hostName: "Rapid1", category: "Articles" }, r)),
    new Promise(r => s4.emit("create-room", { hostId: "h4", hostName: "Rapid2", category: "Articles" }, r)),
    new Promise(r => s4.emit("create-room", { hostId: "h4", hostName: "Rapid3", category: "Articles" }, r))
  ];
  const rapidResults = await Promise.all(promises);
  const successfulRooms = rapidResults.filter(r => r && r.success);
  assert(successfulRooms.length >= 1, "Handled rapid concurrent requests safely without server crash");
  console.log(`Rapid requests results: ${successfulRooms.length} resolved properly`);

  // TEST 5: Backend handles invalid input / missing data cleanly without hanging
  console.log("\n--- TEST 5: Resilient handling of malformed or empty request ---");
  const s5 = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  await new Promise(r => s5.on("connect", r));

  const res5 = await new Promise(resolve => {
    s5.emit("create-room", {}, resolve);
  });
  assert(res5 && res5.success === true && res5.roomId, "Handled empty request with safe defaults without hanging");

  // TEST 6: Multiplayer flow: Host creates room, Guest joins with Room ID, quiz starts
  console.log("\n--- TEST 6: Multiplayer room joining and full flow ---");
  const hostSocket = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  const guestSocket = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });

  await Promise.all([
    new Promise(r => hostSocket.on("connect", r)),
    new Promise(r => guestSocket.on("connect", r))
  ]);

  const hostCreateRes = await new Promise(resolve => {
    hostSocket.emit("create-room", {
      hostId: "host_real_1",
      hostName: "HostAlice",
      category: "Tenses",
      difficulty: "medium",
      questionCount: 10
    }, resolve);
  });

  const createdRoomId = hostCreateRes.roomId;
  assert(hostCreateRes.success && createdRoomId, `Host created room: ${createdRoomId}`);

  // Guest joins using Room ID
  const guestJoinRes = await new Promise(resolve => {
    guestSocket.emit("join-room", {
      roomId: createdRoomId,
      guestId: "guest_real_2",
      playerName: "GuestBob"
    }, resolve);
  });

  assert(guestJoinRes && guestJoinRes.success === true, "Guest successfully joined room using Room ID");
  assert(guestJoinRes.room && guestJoinRes.room.guestPlayer && guestJoinRes.room.guestPlayer.name === "GuestBob", "Guest player recorded properly in room");
  assert(guestJoinRes.room.hostPlayer.name === "HostAlice", "Host player recorded properly in room");

  // Verify third player cannot join (2-player limit)
  const thirdSocket = Client(SOCKET_URL, { reconnection: false, transports: ["websocket"] });
  await new Promise(r => thirdSocket.on("connect", r));
  const thirdJoinRes = await new Promise(resolve => {
    thirdSocket.emit("join-room", {
      roomId: createdRoomId,
      guestId: "intruder_3",
      playerName: "Intruder"
    }, resolve);
  });
  assert(thirdJoinRes && thirdJoinRes.success === false, "Enforced 2-player limit (third player rejected)");

  // Start quiz
  const startQuizRes = await new Promise(resolve => {
    hostSocket.emit("start-quiz", { roomId: createdRoomId }, resolve);
  });
  assert(startQuizRes && startQuizRes.success === true, "Host successfully started quiz countdown");

  // Clean up sockets
  s1.disconnect();
  s2.disconnect();
  s4.disconnect();
  s5.disconnect();
  hostSocket.disconnect();
  guestSocket.disconnect();
  thirdSocket.disconnect();

  console.log("\n==================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
