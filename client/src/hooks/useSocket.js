import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState("");
  const [isFinding, setIsFinding] = useState(false);

  useEffect(() => {
    const socketIo = io();

    socketIo.on("connect", () => {
      setIsConnected(true);
    });

    socketIo.on("disconnect", () => {
      setIsConnected(false);
    });

    socketIo.on("/send-message", (msg) => {
      console.log(msg);
      setMessages(msg);
    });

    socketIo.on("/find-message", (msg) => {
      setIsFinding(msg);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const sendMessage = (message) => {
    if (socket) {
      socket.emit("/send-message", message);
    }
  };

  const setFinding = (message) => {
    if (socket) {
      socket.emit("/find-message", message);
    }
  };

  return { isConnected, messages, sendMessage, isFinding, setFinding };
};
