import { useState } from "react";
import MonacoEditor from "react-monaco-editor";
import { useSocket } from "./hooks/useSocket";

export default function App() {
  const { isConnected, messages, sendMessage, isFinding, setFinding } = useSocket();
  const [textMessage, setTextMessage] = useState("");
  const [isReadEnabled, setIsReadEnabled] = useState(false);

  const handleChange = (text) => {
    sendMessage(text);
    setTextMessage(text);
  };

  return (
    <div className="home-container">
      <div className="content-box">
        <div
          className={`status-text ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}{" "}
          <span
            className="toggle-read-mode"
            onClick={() => setIsReadEnabled(!isReadEnabled)}
          >
            {isReadEnabled ? "Edit Text" : "Read Text"}
          </span>

          <span className={`toggle-find-mode ${isFinding && "toggle-find-mode-red"}`} onClick={() => setFinding(!isFinding)}>{isFinding ? "Finding....." : "Find" }</span>
        </div>
        <div className="message-box">
          <MonacoEditor
            height="100%"
            value={isReadEnabled ? messages : textMessage}
            onChange={handleChange}
            className="text-input"
            placeholder="Type a message..."
            options={{
              selectOnLineNumbers: true,
              minimap: { enabled: false },
              wordWrap: "on",
              readOnly: isReadEnabled,
            }}
          />
        </div>
      </div>
    </div>
  );
}
