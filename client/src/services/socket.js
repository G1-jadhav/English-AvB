import { io } from "socket.io-client";

// Connect to current origin in production/Vite proxy, or fallback to port 5000
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  typeof window !== "undefined" && window.location.port === "5173" 
    ? "http://localhost:5000" 
    : ""
);

export const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"]
});
