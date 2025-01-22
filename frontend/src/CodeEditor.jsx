import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import "./App.css";

const socket = io("http://localhost:3000");

function CodeEditor() {
  const { roomId } = useParams();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start typing your code here...");
  const [output, setOutput] = useState("");

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('codeChange', (data) => {
      setCode(data);
    });

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('codeChange');
    };
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value || "");
    socket.emit('codeChange', { roomId, code: value || "" });
  };

  const runCode = async () => {
    setOutput("Running code...");

    try {
      const response = await fetch("http://localhost:3000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, lang: language }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output.stdout || data.output.stderr || "No output");
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
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
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>
      <div className="my-5">
        <MonacoEditor
          height="60vh"
          width="80%"
          language={language}
          value={code}
          onChange={handleCodeChange}
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

export default CodeEditor;