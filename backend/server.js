import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import problemRoutes from "./routes/problemRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import dotenv from 'dotenv'; 
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
app.use(cors());

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use("/api/problems", problemRoutes);
app.use("/api/execute", executeRoutes);

// Create an HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store code state and cursors for each room
const roomCodeState = {};
const roomCursors = {};

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User ${username} joined room: ${roomId}`);

    // Send the current code state to the new user
    if (roomCodeState[roomId]) {
      socket.emit('codeChange', { code: roomCodeState[roomId] });
    }

    // Send the current cursors to the new user
    if (roomCursors[roomId]) {
      socket.emit('cursorChange', { cursors: roomCursors[roomId] });
    }
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  socket.on('codeChange', ({ roomId, code }) => {
    // Update the code state for the room
    roomCodeState[roomId] = code;
    socket.to(roomId).emit('codeChange', { code });
  });

  socket.on('cursorChange', ({ roomId, username, cursor }) => {
    // Update the cursor state for the room
    if (!roomCursors[roomId]) {
      roomCursors[roomId] = {};
    }
    roomCursors[roomId][username] = cursor;
    socket.to(roomId).emit('cursorChange', { username, cursor });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));