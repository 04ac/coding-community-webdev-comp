import { executeCode } from "../executeCode.js";
import express, { request } from "express";
import { Problem } from "../models/Problem.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { code, language } = req.body;
  
    try {
      const output = await executeCode(code, language);
      res.json({ output });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post("/problem", async (req, res) => {
    const { code, problemId } = req.body;
  
    try {
      const problem = await Problem.findById(problemId);
      if (!problem) return res.status(404).json({ error: "Problem not found" });
  
      const results = await Promise.all(
        problem.testCases.map(async (testCase) => {
          
          const output = await executeCode(`${code}\n${problem.driverCode1}${testCase.input}${problem.driverCode2}`, problem.language);
          
          return {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: output.stdout.trim(),
            passed: output.stdout.trim() === testCase.expectedOutput,
          };
        })
      );
  
      const allPassed = results.every((result) => result.passed);
      res.json({ results, allPassed });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  export default router;