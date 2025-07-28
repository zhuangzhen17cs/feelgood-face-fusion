import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { EmotionData } from '@/hooks/useWebSocket';
import { Bot, Heart, MessageCircle } from 'lucide-react';

interface AIAvatarProps {
  emotionData: EmotionData | null;
  isSessionActive: boolean;
  isSpeaking?: boolean;
}

interface AIExpression {
  eyeOpenness: number;
  mouthShape: 'closed' | 'speaking' | 'smiling' | 'concerned';
  eyebrowPosition: number; // -1 to 1, negative = concerned, positive = surprised
  headTilt: number; // -1 to 1
  blinkTimer: number;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ 
  emotionData, 
  isSessionActive, 
  isSpeaking = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [aiExpression, setAiExpression] = useState<AIExpression>({
    eyeOpenness: 1,
    mouthShape: 'closed',
    eyebrowPosition: 0,
    headTilt: 0,
    blinkTimer: 0,
  });

  // Update AI expression based on user's emotion data
  const updateAIExpression = useCallback((emotions: EmotionData) => {
    const dominantEmotion = Object.entries(emotions)
      .filter(([key]) => key !== 'timestamp')
      .reduce((a, b) => emotions[a[0] as keyof EmotionData] > emotions[b[0] as keyof EmotionData] ? a : b);

    const [emotion, intensity] = dominantEmotion;

    let newExpression: Partial<AIExpression> = {};

    switch (emotion) {
      case 'happy':
        newExpression = {
          mouthShape: 'smiling',
          eyebrowPosition: 0.3,
          headTilt: 0.1,
        };
        break;
      case 'sad':
        newExpression = {
          mouthShape: 'concerned',
          eyebrowPosition: -0.5,
          headTilt: -0.2,
        };
        break;
      case 'angry':
        newExpression = {
          mouthShape: 'closed',
          eyebrowPosition: -0.8,
          headTilt: 0,
        };
        break;
      case 'fearful':
        newExpression = {
          mouthShape: 'concerned',
          eyebrowPosition: 0.6,
          headTilt: 0.3,
        };
        break;
      case 'surprised':
        newExpression = {
          mouthShape: 'speaking',
          eyebrowPosition: 0.8,
          headTilt: 0,
        };
        break;
      default:
        newExpression = {
          mouthShape: isSpeaking ? 'speaking' : 'closed',
          eyebrowPosition: 0.1,
          headTilt: 0,
        };
    }

    setAiExpression(prev => ({
      ...prev,
      ...newExpression,
    }));
  }, [isSpeaking]);

  // Update expression when emotion data changes
  useEffect(() => {
    if (emotionData) {
      updateAIExpression(emotionData);
    }
  }, [emotionData, updateAIExpression]);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setAiExpression(prev => ({
        ...prev,
        blinkTimer: Date.now(),
      }));
    }, 3000 + Math.random() * 2000); // Random blink every 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Draw AI therapist avatar
  const drawAIAvatar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const size = 350;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;

    // Apply head tilt
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(aiExpression.headTilt * 0.15);
    ctx.translate(-centerX, -centerY);

    // Draw face (professional, calming appearance)
    ctx.fillStyle = '#F5E6D3'; // Warm skin tone
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90, 0, 2 * Math.PI);
    ctx.fill();

    // Draw hair (professional style)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 30, 95, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Draw eyes
    const eyeY = centerY - 25;
    const isBlinking = Date.now() - aiExpression.blinkTimer < 150;
    
    // Left eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    if (!isBlinking) {
      ctx.ellipse(centerX - 30, eyeY, 12, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pupil
      ctx.fillStyle = '#4A5568';
      ctx.beginPath();
      ctx.arc(centerX - 30, eyeY, 6, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Closed eye
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 42, eyeY);
      ctx.lineTo(centerX - 18, eyeY);
      ctx.stroke();
    }

    // Right eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    if (!isBlinking) {
      ctx.ellipse(centerX + 30, eyeY, 12, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pupil
      ctx.fillStyle = '#4A5568';
      ctx.beginPath();
      ctx.arc(centerX + 30, eyeY, 6, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Closed eye
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + 18, eyeY);
      ctx.lineTo(centerX + 42, eyeY);
      ctx.stroke();
    }

    // Draw eyebrows
    const browY = centerY - 40;
    const browOffset = aiExpression.eyebrowPosition * 8;
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(centerX - 42, browY - browOffset);
    ctx.lineTo(centerX - 18, browY - browOffset + (aiExpression.eyebrowPosition * 3));
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(centerX + 18, browY - browOffset + (aiExpression.eyebrowPosition * 3));
    ctx.lineTo(centerX + 42, browY - browOffset);
    ctx.stroke();

    // Draw nose
    ctx.fillStyle = '#E8D5C4';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 5, 8, 10, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw mouth based on expression
    const mouthY = centerY + 35;
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;

    switch (aiExpression.mouthShape) {
      case 'smiling':
        ctx.beginPath();
        ctx.arc(centerX, mouthY - 15, 20, 0.3 * Math.PI, 0.7 * Math.PI);
        ctx.stroke();
        break;
      
      case 'speaking':
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY, 10, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;
      
      case 'concerned':
        ctx.beginPath();
        ctx.arc(centerX, mouthY + 15, 20, 1.3 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
        break;
      
      default: // closed
        ctx.beginPath();
        ctx.moveTo(centerX - 12, mouthY);
        ctx.lineTo(centerX + 12, mouthY);
        ctx.stroke();
    }

    // Draw glasses (professional touch)
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

    // Left lens
    ctx.beginPath();
    ctx.ellipse(centerX - 30, eyeY, 18, 14, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.ellipse(centerX + 30, eyeY, 18, 14, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(centerX - 12, eyeY);
    ctx.lineTo(centerX + 12, eyeY);
    ctx.stroke();

    ctx.restore();
  }, [aiExpression]);

  // Animation loop
  const animate = useCallback(() => {
    drawAIAvatar();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [drawAIAvatar]);

  // Start animation when session is active
  useEffect(() => {
    if (isSessionActive) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSessionActive, animate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Dr. Aria</h2>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <span className="text-sm text-muted-foreground">
            {isSpeaking ? 'Speaking' : 'Listening'}
          </span>
        </div>
      </div>

      {/* Main avatar area */}
      <div className="flex-1 p-6">
        <Card className="avatar-container h-full flex items-center justify-center relative">
          {!isSessionActive ? (
            // Inactive state
            <div className="text-center p-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dr. Aria</h3>
              <p className="text-muted-foreground max-w-sm">
                Your AI therapist is ready to provide emotional support and guidance
              </p>
            </div>
          ) : (
            // Active state
            <div className="relative w-full h-full flex items-center justify-center">
              {/* AI Avatar Canvas */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full rounded-2xl"
                style={{ 
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.1))',
                }}
              />
              
              {/* Speaking indicator */}
              {isSpeaking && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                    <MessageCircle className="w-3 h-3" />
                    Speaking...
                  </div>
                </div>
              )}

              {/* Emotion response indicator */}
              {emotionData && (
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-muted-foreground">Responding to your emotions</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};