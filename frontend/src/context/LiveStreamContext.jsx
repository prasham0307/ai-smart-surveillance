import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const LiveStreamContext = createContext();

export const useLiveStream = () => useContext(LiveStreamContext);

export const LiveStreamProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [latestFrame, setLatestFrame] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [framesProcessed, setFramesProcessed] = useState(0);
  
  const wsRef = useRef(null);

  // Fetch cameras when user logs in
  useEffect(() => {
    if (!user?.token) return;
    const fetchCameras = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/cameras/', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCameras(response.data);
      } catch (err) {
        console.error('Failed to fetch cameras', err);
      }
    };
    fetchCameras();
  }, [user]);

  const connectWebSocket = () => {
    if (wsRef.current) return;
    
    const ws = new WebSocket(`ws://localhost:8000/api/live/webcam/${selectedCameraId}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      setAlerts([]);
      setFramesProcessed(0);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'frame') {
        setLatestFrame(`data:image/jpeg;base64,${data.data}`);
        setFramesProcessed(data.frame_index);
      } else if (data.type === 'alert') {
        setAlerts((prev) => [...prev, data]);
        // Trigger global toast even if user is on a different tab!
        addToast(`${data.label.toUpperCase()} DETECTED! Check live feed immediately.`, 'alert');
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // We DO NOT cleanup on unmount because this context sits at the root!
  // The stream stays alive until user clicks "Stop Camera" or logs out.

  // If user logs out, kill the connection
  useEffect(() => {
    if (!user && wsRef.current) {
      disconnectWebSocket();
    }
  }, [user]);

  return (
    <LiveStreamContext.Provider value={{
      cameras,
      selectedCameraId,
      setSelectedCameraId,
      isConnected,
      latestFrame,
      alerts,
      framesProcessed,
      connectWebSocket,
      disconnectWebSocket
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
};
