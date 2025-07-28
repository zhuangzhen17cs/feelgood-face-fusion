import React, { useEffect, useRef, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useFaceTracking, FaceExpressions } from '@/hooks/useFaceTracking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface UserAvatarProps {
  isSessionActive: boolean;
  onExpressionChange?: (expressions: FaceExpressions | null) => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  isSessionActive, 
  onExpressionChange 
}) => {
  const { 
    videoRef, 
    canvasRef, 
    isStreaming, 
    error: cameraError, 
    startCamera, 
    stopCamera, 
    captureFrame 
  } = useCamera();

  const { 
    landmarks, 
    expressions, 
    isModelLoaded, 
    error: trackingError, 
    processFrame 
  } = useFaceTracking();

  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Notify parent component of expression changes
  useEffect(() => {
    onExpressionChange?.(expressions);
  }, [expressions, onExpressionChange]);

  // Start/stop camera based on session state
  useEffect(() => {
    if (isSessionActive && !isStreaming) {
      startCamera();
    } else if (!isSessionActive && isStreaming) {
      stopCamera();
    }
  }, [isSessionActive, isStreaming, startCamera, stopCamera]);

  // Process video frames for face tracking
  const processVideoFrame = useCallback(() => {
    if (!isStreaming || !isModelLoaded) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    const frameData = captureFrame();
    if (frameData) {
      processFrame(frameData);
    }

    animationFrameRef.current = requestAnimationFrame(processVideoFrame);
  }, [isStreaming, isModelLoaded, captureFrame, processFrame]);

  // Start frame processing loop
  useEffect(() => {
    if (isSessionActive) {
      processVideoFrame();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSessionActive, processVideoFrame]);

  // Draw cartoon avatar based on face landmarks and expressions
  const drawCartoonAvatar = useCallback(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas || !expressions) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;

    // Draw face (circle)
    ctx.fillStyle = '#FFE0BD'; // Skin tone
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
    ctx.fill();

    // Draw eyes
    const eyeY = centerY - 20;
    const eyeOpenness = expressions.eyesOpen;
    
    // Left eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    if (eyeOpenness > 0.3) {
      ctx.arc(centerX - 25, eyeY, 8, 0, 2 * Math.PI);
    } else {
      // Closed eye (line)
      ctx.moveTo(centerX - 33, eyeY);
      ctx.lineTo(centerX - 17, eyeY);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fill();

    // Right eye
    ctx.beginPath();
    if (eyeOpenness > 0.3) {
      ctx.arc(centerX + 25, eyeY, 8, 0, 2 * Math.PI);
    } else {
      // Closed eye (line)
      ctx.moveTo(centerX + 17, eyeY);
      ctx.lineTo(centerX + 33, eyeY);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fill();

    // Draw eyebrows
    const browY = centerY - 35;
    const browRaise = expressions.eyebrowsRaised * 10;
    ctx.strokeStyle = '#8B4513'; // Brown
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(centerX - 35, browY - browRaise);
    ctx.lineTo(centerX - 15, browY - browRaise);
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(centerX + 15, browY - browRaise);
    ctx.lineTo(centerX + 35, browY - browRaise);
    ctx.stroke();

    // Draw nose
    ctx.fillStyle = '#FFD4A9';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 5, 6, 8, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw mouth based on expressions
    const mouthY = centerY + 30;
    const smileAmount = expressions.smiling;
    const mouthOpen = expressions.mouthOpen;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();

    if (mouthOpen > 0.3) {
      // Open mouth (oval)
      ctx.fillStyle = '#8B0000'; // Dark red
      ctx.ellipse(centerX, mouthY, 12, 8 + mouthOpen * 10, 0, 0, 2 * Math.PI);
      ctx.fill();
    } else if (smileAmount > 0.3) {
      // Smile (curve up)
      ctx.arc(centerX, mouthY - 20, 25, 0.2 * Math.PI, 0.8 * Math.PI);
    } else {
      // Neutral mouth (straight line)
      ctx.moveTo(centerX - 15, mouthY);
      ctx.lineTo(centerX + 15, mouthY);
    }
    ctx.stroke();

    // Add head tilt
    const tilt = expressions.headTilt * 0.1; // Subtle tilt
    if (Math.abs(tilt) > 0.02) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tilt);
      ctx.translate(-centerX, -centerY);
      // Redraw with tilt if needed
      ctx.restore();
    }
  }, [expressions]);

  // Update cartoon avatar when expressions change
  useEffect(() => {
    if (expressions) {
      drawCartoonAvatar();
    }
  }, [expressions, drawCartoonAvatar]);

  const hasError = cameraError || trackingError;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Your Avatar</h2>
        <div className="flex items-center gap-2">
          {isModelLoaded ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          ) : (
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
          <span className="text-sm text-muted-foreground">
            {isModelLoaded ? 'Ready' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Main avatar area */}
      <div className="flex-1 p-6">
        <Card className="avatar-container h-full flex items-center justify-center relative">
          {hasError ? (
            // Error state
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {cameraError || trackingError}
              </p>
              <Button 
                onClick={startCamera} 
                variant="outline"
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Retry Camera
              </Button>
            </div>
          ) : !isSessionActive ? (
            // Inactive state
            <div className="text-center p-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center">
                <CameraOff className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Start</h3>
              <p className="text-muted-foreground">
                Your cartoon avatar will appear here when the session begins
              </p>
            </div>
          ) : (
            // Active state
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Cartoon Avatar Canvas */}
              <canvas
                ref={avatarCanvasRef}
                className="max-w-full max-h-full rounded-2xl animate-breathing"
                style={{ 
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.1))',
                }}
              />
              
              {/* Status indicators */}
              {expressions && (
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1">
                  <div className="flex justify-between gap-4">
                    <span>😊</span>
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${expressions.smiling * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>👁️</span>
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${expressions.eyesOpen * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Hidden video elements for camera processing */}
      <div className="hidden">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};