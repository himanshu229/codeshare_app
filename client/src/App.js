import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const setDimensions = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      video.width = screenWidth;
      video.height = screenHeight;

      canvas.width = screenWidth;
      canvas.height = screenHeight;
    }
  };

  useEffect(() => {
    setDimensions();
    window.addEventListener('resize', setDimensions);

    socketRef.current = io();
    console.log('Connected to Socket.IO server');

    socketRef.current.on('screen-data', (data) => {
      const image = new Image();
      image.src = data;
      image.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
      image.onerror = (error) => {
        console.error('Error loading image:', error);
      };
    });

    return () => {
      window.removeEventListener('resize', setDimensions);
      socketRef.current.disconnect();
    };
  }, []);

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      videoRef.current.srcObject = stream;
      console.log('Screen sharing started');

      videoRef.current.onplay = () => {
        console.log('Video started playing');

        setInterval(() => {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const data = canvasRef.current.toDataURL('image/jpeg', 0.5);
          socketRef.current.emit('screen-data', data);
        }, 100);
      };

      canvasRef.current.addEventListener('mousedown', (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        socketRef.current.emit('mouse-event', { type: 'mousedown', x, y });
      });
      
      canvasRef.current.addEventListener('mouseup', (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        socketRef.current.emit('mouse-event', { type: 'mouseup', x, y });
      });
      
      canvasRef.current.addEventListener('mousemove', (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        socketRef.current.emit('mouse-event', { type: 'mousemove', x, y });
      });
      
      canvasRef.current.addEventListener('click', (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        socketRef.current.emit('mouse-event', { type: 'click', x, y });
      });
      
      canvasRef.current.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        socketRef.current.emit('mouse-event', { type: 'rightclick', x, y });
      });
      
      canvasRef.current.addEventListener('wheel', (e) => {
        const deltaY = e.deltaY;
        socketRef.current.emit('mouse-event', { type: 'scroll', deltaY });
      });
      
      // Keyboard events
      window.addEventListener('keydown', (e) => {
        socketRef.current.emit('keyboard-event', { type: 'keydown', key: e.key });
      });
      
      window.addEventListener('keyup', (e) => {
        socketRef.current.emit('keyboard-event', { type: 'keyup', key: e.key });
      });

    
      setIsSharing(true);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center'}}>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid black',
          backgroundColor: 'white',
          maxWidth: '100%',
          maxHeight: '100vh',
        }}
      />
      {!isSharing && <button onClick={startSharing}>Start Sharing</button>}
    </div>
  );
};

export default App;