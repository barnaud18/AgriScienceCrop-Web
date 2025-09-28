import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';

export interface WebSocketMessage {
  type: 'monitoring_data' | 'new_alert' | 'auth';
  data?: any;
  alert?: any;
  status?: string;
  message?: string;
}

export function useWebSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // In Replit, use the same host/port as the current page
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Authenticate with token
      ws.current?.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        if (message.type === 'auth' && message.status === 'success') {
          console.log('WebSocket authenticated successfully');
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect if not manually closed and within retry limit
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          connect();
        }, timeout);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}