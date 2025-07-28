import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Square, Mic, MicOff, Loader2 } from 'lucide-react';

interface SessionControlsProps {
  isSessionActive: boolean;
  isConnected: boolean;
  isLoading: boolean;
  onToggleSession: () => void;
  onToggleMic?: () => void;
  isMicEnabled?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isSessionActive,
  isConnected,
  isLoading,
  onToggleSession,
  onToggleMic,
  isMicEnabled = true,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} 
            />
            <span className="text-muted-foreground">
              {isConnected ? 'Connected to UnTherapy' : 'Disconnected'}
            </span>
          </div>

          {/* Main Session Button */}
          <Button
            onClick={onToggleSession}
            disabled={isLoading || !isConnected}
            size="lg"
            className={`session-button w-48 h-16 text-lg font-semibold transition-all duration-300 ${
              isSessionActive 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                {isSessionActive ? 'Ending...' : 'Starting...'}
              </>
            ) : isSessionActive ? (
              <>
                <Square className="w-6 h-6 mr-3" />
                End Session
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                Start Session
              </>
            )}
          </Button>

          {/* Session Info */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">
              {isSessionActive ? 'Session Active' : 'Ready to Begin'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {isSessionActive 
                ? 'Your emotional support session is now active. Dr. Aria is listening and ready to help.'
                : 'Start your session to begin real-time emotion analysis and receive personalized support from Dr. Aria.'
              }
            </p>
          </div>

          {/* Microphone Controls */}
          {isSessionActive && onToggleMic && (
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <Button
                onClick={onToggleMic}
                variant={isMicEnabled ? "outline" : "destructive"}
                size="sm"
                className="gap-2"
              >
                {isMicEnabled ? (
                  <>
                    <Mic className="w-4 h-4" />
                    Mic On
                  </>
                ) : (
                  <>
                    <MicOff className="w-4 h-4" />
                    Mic Off
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                {isMicEnabled ? 'Voice input enabled' : 'Voice input disabled'}
              </span>
            </div>
          )}

          {/* Tips */}
          {!isSessionActive && (
            <div className="text-center pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium mb-2">Tips for your session:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 max-w-sm">
                <li>• Ensure good lighting for accurate emotion detection</li>
                <li>• Speak clearly for voice analysis</li>
                <li>• Be open and honest about your feelings</li>
                <li>• Take your time - Dr. Aria is here to listen</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};