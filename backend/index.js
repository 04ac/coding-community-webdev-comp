import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import problemRoutes from "./routes/problemRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import dotenv from 'dotenv'; 

dotenv.config();

const app = express();

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use("/api/problems", problemRoutes);
app.use("/api/execute", executeRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
