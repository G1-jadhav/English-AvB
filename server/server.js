import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { RoomManager } from "./utils/roomManager.js";
import { setupQuizSocket } from "./socket/quizSocket.js";
import { questionsBank } from "./data/questions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager(io);
setupQuizSocket(io, roomManager);

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", activeRooms: roomManager.rooms.size, time: new Date() });
});

app.get("/api/room/:roomId", (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json({ room: roomManager.sanitizeRoom(room) });
});

app.get("/api/categories", (req, res) => {
  const categories = ["Grammar", "Vocabulary", "Tenses", "Articles", "Prepositions", "Mixed English"];
  res.json({ categories, totalQuestions: questionsBank.length });
});

// Serve frontend in production build if present
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/api") || req.url.startsWith("/socket.io")) {
    return next();
  }
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      res.status(200).send("English Quiz API Server is running on port " + PORT);
    }
  });
});

server.listen(PORT, () => {
  console.log(`[English AvB Quiz Server] Running on http://localhost:${PORT}`);
});
