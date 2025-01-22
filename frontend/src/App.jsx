import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Lobby from "./Lobby";
import CodeEditor from "./CodeEditor";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<CodeEditor />} />
      </Routes>
    </Router>
  );
}

export default App;