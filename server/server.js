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

// Allowed frontend origins for CORS
const allowedOrigins = [
  "https://english-battle-kappa.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000"
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach(url => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

function checkOrigin(origin, callback) {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
  ) {
    return callback(null, true);
  }
  // In development or preview, fallback to allowing the origin
  return callback(null, true);
}

const corsOptions = {
  origin: checkOrigin,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 20000
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
