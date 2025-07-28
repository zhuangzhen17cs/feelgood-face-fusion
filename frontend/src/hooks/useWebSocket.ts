import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface EmotionData {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  neutral: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface WebSocketData {
  emotionData: EmotionData | null;
  chatMessages: ChatMessage[];
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  sendAudioData: (audioBlob: Blob) => void;
}

export const useWebSocket = (serverUrl: string = 'ws://localhost:8000/untherapy'): WebSocketData => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to UnTherapy backend');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('🔄 Connection failed:', error.message);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(connect, 2000 * reconnectAttempts.current);
      }
    });

    // Listen for emotion data from AI analysis
    newSocket.on('emotion_update', (data: EmotionData) => {
      setEmotionData(data);
    });

    // Listen for chat messages
    newSocket.on('chat_message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Listen for AI responses
    newSocket.on('ai_response', (response: { content: string; emotion?: string }) => {
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        content: response.content,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    });

    setSocket(newSocket);
  }, [serverUrl, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setChatMessages([]);
      setEmotionData(null);
    }
  }, [socket]);

  const sendMessage = useCallback((message: string) => {
    if (socket && isConnected) {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: message,
        sender: 'user',
        timestamp: Date.now(),
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      socket.emit('user_message', { content: message, timestamp: Date.now() });
    }
  }, [socket, isConnected]);

  const sendAudioData = useCallback((audioBlob: Blob) => {
    if (socket && isConnected) {
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result as string;
        socket.emit('audio_data', {
          audio: base64Audio.split(',')[1], // Remove data:audio/... prefix
          timestamp: Date.now(),
        });
      };
      reader.readAsDataURL(audioBlob);
    }
  }, [socket, isConnected]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    emotionData,
    chatMessages,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendAudioData,
  };
};