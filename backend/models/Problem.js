import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp'],
  },
  starterCode: { type: String, required: true },
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  languages: [languageSchema],
});

export const Problem = mongoose.model("Problem", problemSchema);