import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import "./App.css";

function App() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start typing your code here...");
  const [output, setOutput] = useState("");

  // Override console.log to capture outputs
  const captureConsoleLogs = () => {
    const logs = [];
    const originalConsoleLog = console.log;

    console.log = function (...args) {
      logs.push(args.join(" "));
      originalConsoleLog.apply(console, args);
      setOutput((prev) => prev + args.join(" ") + "\n");
    };

    return () => {
      console.log = originalConsoleLog; // Restore the original console.log
    };
  };

  const runCode = () => {
    if (language !== "javascript") {
      setOutput(`Running ${language} code requires backend support.`);
      return;
    }

    // Clear previous output
    setOutput("");

    // Capture console logs
    const restoreConsole = captureConsoleLogs();

    try {
      // Use Function to safely evaluate JavaScript code
      new Function(code)();
    } catch (error) {
      setOutput(String(error));
    } finally {
      restoreConsole(); // Restore the original console.log
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-5xl my-5">Code Editor</h1>
      <div className="my-5">
        <label htmlFor="language" className="mr-3 font-bold text-lg">
          Choose Language:
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div className="my-5">
        <MonacoEditor
          height="60vh"
          width="80%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
        />
      </div>
      <button
        onClick={runCode}
        className="p-2 bg-blue-500 text-white rounded my-4"
      >
        Run Code
      </button>
      <div
        className="bg-black text-white p-4 rounded"
        style={{
          width: "80%",
          margin: "0 auto",
          height: "200px",
          overflowY: "scroll",
          whiteSpace: "pre-wrap",
        }}
      >
        <h3 className="font-bold">Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;
