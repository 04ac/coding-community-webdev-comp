import { executeCode } from "../executeCode.js";
import express, { request } from "express";
import { Problem } from "../models/Problem.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { code, lang } = req.body;
  
    try {
      const output = await executeCode(code, lang);
      res.json({ output });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // router.post("/problem", async (req, res) => {
  //   const { code, problemId, lang } = req.body;
  
  //   try {
  //     // const problem = await Problem.findById(problemId);
  //    // if (!problem) return res.status(404).json({ error: "Problem not found" });
  
  //     const output = await executeCode(code, lang);
  
  //     res.json({ output: output.stdout.trim() });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // });

  export default router;