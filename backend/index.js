import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import problemRoutes from "./routes/problemRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/problems", problemRoutes);
app.use("/api/execute", executeRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const CURSOR_COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
];
let colorIndex = 0;

const roomStates = new Map();

function getRoomState(roomId) {
  if (!roomStates.has(roomId)) {
    roomStates.set(roomId, {
      code: "// Start coding here...",
      users: new Map(),
      cursors: new Map(),
    });
  }
  return roomStates.get(roomId);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    const roomState = getRoomState(roomId);

    const userColor = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length];
    colorIndex++;

    roomState.users.set(username, {
      color: userColor,
      socketId: socket.id,
    });

    socket.emit("initState", {
      code: roomState.code,
      color: userColor,
      cursors: Array.from(roomState.cursors.entries()),
    });

    socket.to(roomId).emit("userJoined", {
      username,
      color: userColor,
    });

    console.log(`${username} joined room ${roomId} with color ${userColor}`);
  });

  socket.on("codeChange", ({ roomId, code }) => {
    const roomState = getRoomState(roomId);
    roomState.code = code;
    socket.to(roomId).emit("codeChange", code);
  });

  socket.on("cursorMove", ({ roomId, username, position }) => {
    const roomState = getRoomState(roomId);
    const user = roomState.users.get(username);
    if (user) {
      roomState.cursors.set(username, { position, color: user.color });
      socket.to(roomId).emit("cursorMove", {
        username,
        position,
        color: user.color,
      });
    }
  });

  socket.on("codeOutput", ({ roomId, output }) => {
    socket.to(roomId).emit("codeOutput", output);
  });

  socket.on("leaveRoom", ({ roomId, username }) => {
    const roomState = getRoomState(roomId);
    roomState.users.delete(username);
    roomState.cursors.delete(username);
    socket.leave(roomId);
    io.to(roomId).emit("userLeft", { username });
    console.log(`${username} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    roomStates.forEach((state, roomId) => {
      for (let [username, userData] of state.users.entries()) {
        if (userData.socketId === socket.id) {
          state.users.delete(username);
          state.cursors.delete(username);
          io.to(roomId).emit("userLeft", { username });
          break;
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});