import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Lobby() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (room.trim()) {
      navigate(`/room/${room}`);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-5xl my-5">Join a Room</h1>
      <div className="my-5">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={handleJoinRoom}
          className="p-2 bg-blue-500 text-white rounded ml-2"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Lobby;