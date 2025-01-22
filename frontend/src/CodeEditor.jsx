import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { useParams, useLocation } from "react-router-dom";
import "./App.css";

const socket = io("http://localhost:3000");

function CodeEditor() {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || "Anonymous";

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start typing your code here...");
  const [output, setOutput] = useState("");
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    socket.emit("joinRoom", { roomId, username });

    socket.on("initState", (state) => {
      setCode(state.code);
    });

    socket.on("codeChange", (updatedCode) => {
      setCode(updatedCode);
    });

    socket.on("cursorMove", ({ username: user, position, color }) => {
      setCursors((prev) => ({
        ...prev,
        [user]: { position, color },
      }));
    });

    socket.on("codeOutput", (result) => {
      setOutput(result);
    });

    return () => {
      socket.emit("leaveRoom", { roomId, username });
      socket.off("initState");
      socket.off("codeChange");
      socket.off("cursorMove");
      socket.off("codeOutput");
    };
  }, [roomId, username]);

  useEffect(() => {
    // Make sure we have a monaco instance and an editor instance
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    // Decorate cursors
    const newDecorations = Object.entries(cursors).map(([user, { position, color }]) => {
      const { lineNumber, column } = position;
      return {
        range: new monaco.Range(lineNumber, column, lineNumber, column + 1),
        options: {
          className: `cursor-${user}`,
          hoverMessage: { value: user },
          beforeContentClassName: "cursor-decoration",
          before: {
            content: "|",
            inlineClassName: `cursor-color-${user}`,
            color,
          },
        },
      };
    });
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [cursors]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("codeChange", { roomId, code: value });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.onDidChangeCursorPosition(() => {
      const position = editor.getPosition();
      socket.emit("cursorMove", {
        roomId,
        username,
        position: {
          lineNumber: position.lineNumber,
          column: position.column,
        },
      });
    });
  };

  const runCode = async () => {
    setOutput("Running code...");
    try {
      const response = await fetch("http://localhost:3000/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lang: language }),
      });
      const data = await response.json();
      const result = response.ok
        ? data.output.stdout || data.output.stderr || "No output"
        : `Error: ${data.error}`;
      setOutput(result);
      socket.emit("codeOutput", { roomId, output: result });
    } catch (error) {
      const errorText = `Error: ${error.message}`;
      setOutput(errorText);
      socket.emit("codeOutput", { roomId, output: errorText });
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-4xl my-5">Code Editor</h1>
      <div className="my-5">
        <label htmlFor="language" className="mr-3 font-bold text-lg">
          Language:
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
          onMount={handleEditorDidMount}
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
        className="bg-black text-white p-4 rounded mx-auto"
        style={{
          width: "80%",
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