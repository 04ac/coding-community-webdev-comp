import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false }, // Distinguish sample test cases
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  starterCode: { type: String, required: true },
  driverCode1: { type: String, required: true },
  driverCode2: { type: String, required: true },
  testCases: [testCaseSchema], // Array of test cases
});

export const Problem = mongoose.model("Problem", problemSchema);
