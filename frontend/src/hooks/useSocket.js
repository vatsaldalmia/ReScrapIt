import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/client';

// Establishes a single Socket.IO connection while authenticated.
export default function useSocket(enabled = true) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  return socketRef;
}
