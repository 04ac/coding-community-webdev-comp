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

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeChange', code);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));