import { io } from "socket.io-client";

// Resolve Socket server URL:
// 1. Explicit VITE_SOCKET_URL environment variable (production / custom backend)
// 2. Fallback VITE_SERVER_URL environment variable
// 3. Localhost fallback when running in development mode or accessing via localhost/127.0.0.1
// 4. Default to empty string (same-origin) if deployed together with backend
const isLocalhost = typeof window !== "undefined" && (
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1" || 
  window.location.port === "5173"
);

export const SOCKET_URL = 
  import.meta.env.VITE_SOCKET_URL || 
  import.meta.env.VITE_SERVER_URL || 
  (import.meta.env.DEV || isLocalhost ? "http://localhost:5000" : "");

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
  withCredentials: true
});

// Explicit debugging requested for production verification
console.log("=== SOCKET DEBUG ===");
console.log("Socket URL:", SOCKET_URL ? SOCKET_URL : "(same-origin window.location.origin)");
console.log("Socket connected:", socket.connected);
console.log("Socket ID:", socket.id);

socket.on("connect", () => {
  console.log("=== SOCKET CONNECTED ===");
  console.log("ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("=== SOCKET ERROR ===");
  console.error(error.message);
  console.error(error);
});

socket.on("disconnect", (reason) => {
  console.warn("=== SOCKET DISCONNECTED ===");
  console.warn(reason);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`[Socket.IO Client] Attempting reconnect #${attempt}...`);
});

socket.on("reconnect", (attempt) => {
  console.log("%c[Socket.IO Client] Reconnected on attempt #" + attempt, "color: #10B981; font-weight: bold;");
});

socket.on("reconnect_error", (error) => {
  console.error("[Socket.IO Client] Reconnect error:", error.message);
});

if (typeof window !== "undefined") {
  window.__SOCKET__ = socket;
}
