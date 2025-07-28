import React, { useState, useCallback } from 'react';
import { UserAvatar } from './UserAvatar';
import { AIAvatar } from './AIAvatar';
import { EmotionMeter } from './EmotionMeter';
import { SessionControls } from './SessionControls';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FaceExpressions } from '@/hooks/useFaceTracking';
import { Button } from '@/components/ui/button';
import { Heart, Settings, Info } from 'lucide-react';
import { toast } from 'sonner';

export const UnTherapyLayout: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [userExpressions, setUserExpressions] = useState<FaceExpressions | null>(null);
  
  const {
    emotionData,
    chatMessages,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendAudioData,
  } = useWebSocket();

  const handleToggleSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (!isSessionActive) {
        // Start session
        if (!isConnected) {
          connect();
          // Wait a moment for connection
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        setIsSessionActive(true);
        toast.success('Session started! Dr. Aria is now listening.', {
          description: 'Your emotions are being analyzed in real-time.',
        });
      } else {
        // End session
        setIsSessionActive(false);
        disconnect();
        toast.info('Session ended. Thank you for using UnTherapy.', {
          description: 'Your privacy is protected - no data is stored.',
        });
      }
    } catch (error) {
      toast.error('Failed to toggle session', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSessionActive, isConnected, connect, disconnect]);

  const handleToggleMic = useCallback(() => {
    setIsMicEnabled(!isMicEnabled);
    toast.info(isMicEnabled ? 'Microphone disabled' : 'Microphone enabled');
  }, [isMicEnabled]);

  const handleUserExpressionChange = useCallback((expressions: FaceExpressions | null) => {
    setUserExpressions(expressions);
    
    // Send expression data to backend for emotion analysis
    if (expressions && isSessionActive && isConnected) {
      // Convert expressions to emotion-like data for demo
      const emotionData = {
        happy: expressions.smiling,
        sad: expressions.mouthOpen > 0.5 && expressions.smiling < 0.3 ? 0.7 : 0.2,
        angry: expressions.eyebrowsRaised < -0.3 ? 0.6 : 0.1,
        fearful: expressions.eyesOpen > 0.8 && expressions.eyebrowsRaised > 0.5 ? 0.5 : 0.1,
        surprised: expressions.eyebrowsRaised > 0.7 ? 0.8 : 0.1,
        neutral: 1 - (expressions.smiling + Math.max(expressions.eyebrowsRaised, 0)),
        disgusted: 0.1,
        timestamp: Date.now(),
      };
      
      // This would normally be sent to the backend
      console.log('📊 Emotion data:', emotionData);
    }
  }, [isSessionActive, isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  UnTherapy
                </h1>
                <p className="text-sm text-muted-foreground">AI-Powered Emotional Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Info className="w-4 h-4" />
                About
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - User Avatar */}
          <div className="lg:col-span-1">
            <div className="h-full animate-therapy-fade">
              <UserAvatar 
                isSessionActive={isSessionActive}
                onExpressionChange={handleUserExpressionChange}
              />
            </div>
          </div>

          {/* Center Panel - Session Controls & Emotion Meter */}
          <div className="lg:col-span-1 space-y-6">
            {/* Session Controls */}
            <div className="animate-therapy-fade" style={{ animationDelay: '0.2s' }}>
              <SessionControls
                isSessionActive={isSessionActive}
                isConnected={isConnected}
                isLoading={isLoading}
                onToggleSession={handleToggleSession}
                onToggleMic={handleToggleMic}
                isMicEnabled={isMicEnabled}
              />
            </div>

            {/* Emotion Meter */}
            <div className="animate-therapy-fade" style={{ animationDelay: '0.4s' }}>
              <EmotionMeter emotionData={emotionData} />
            </div>
          </div>

          {/* Right Panel - AI Avatar */}
          <div className="lg:col-span-1">
            <div className="h-full animate-therapy-fade" style={{ animationDelay: '0.6s' }}>
              <AIAvatar 
                emotionData={emotionData}
                isSessionActive={isSessionActive}
                isSpeaking={false} // Would be connected to voice activity detection
              />
            </div>
          </div>
        </div>

        {/* Demo Note */}
        {!isConnected && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-center">
            <p className="text-sm">
              <strong>Demo Mode:</strong> Backend connection not available. 
              The interface is fully functional for demonstration purposes.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            UnTherapy • Your privacy matters • No session data is stored
          </p>
        </div>
      </footer>
    </div>
  );
};