import { useState } from "react";
import { useSocket } from "./hooks/useSocket";

export default function App() {
  const { isConnected, messages, sendMessage } = useSocket();
  const [textMessage, setTextMessage] = useState("");
  const [isReadEnabled, setIsReadEnabled] = useState(false);

  const handleChange = (text) => {
    sendMessage(text);
    setTextMessage(text);
  };

  return (
    <div className="home-container">
      <div className="content-box">
        <div className={`status-text ${isConnected ? "connected" : "disconnected"}`}>
          {isConnected ? "Connected" : "Disconnected"}{" "}
          <span
            className="toggle-read-mode"
            onClick={() => setIsReadEnabled(!isReadEnabled)}
          >
            {isReadEnabled ? "Edit Text" : "Read Text"}
          </span>
        </div>
        <div className="message-box">
          {isReadEnabled ? (
            <p className="text-input">{messages.length > 0 ? messages : ".........................."}</p>
          ) : (
            <textarea
              value={textMessage}
              onChange={(e) => handleChange(e.target.value)}
              className="text-input"
              placeholder="Type a message..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
