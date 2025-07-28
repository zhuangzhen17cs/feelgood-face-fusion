import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EmotionData } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp } from 'lucide-react';

// Register required components
echarts.use([
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

interface EmotionMeterProps {
  emotionData: EmotionData | null;
  className?: string;
}

export const EmotionMeter: React.FC<EmotionMeterProps> = ({ emotionData, className }) => {
  const chartOptions = useMemo(() => {
    if (!emotionData) {
      return null;
    }

    const emotions = [
      { name: 'Happy', value: emotionData.happy, color: '#10B981' },
      { name: 'Sad', value: emotionData.sad, color: '#3B82F6' },
      { name: 'Angry', value: emotionData.angry, color: '#EF4444' },
      { name: 'Fearful', value: emotionData.fearful, color: '#8B5CF6' },
      { name: 'Surprised', value: emotionData.surprised, color: '#F59E0B' },
      { name: 'Neutral', value: emotionData.neutral, color: '#6B7280' },
    ];

    return {
      backgroundColor: 'transparent',
      radar: {
        indicator: emotions.map(emotion => ({
          name: emotion.name,
          max: 1,
          color: '#64748B',
        })),
        center: ['50%', '50%'],
        radius: '65%',
        startAngle: 90,
        splitNumber: 4,
        shape: 'polygon',
        name: {
          formatter: '{value}',
          textStyle: {
            color: '#64748B',
            fontSize: 11,
            fontWeight: 500,
          },
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(180, 53, 45, 0.05)', 'rgba(180, 53, 45, 0.1)'],
          },
        },
        splitLine: {
          lineStyle: {
            color: '#E2E8F0',
            width: 1,
          },
        },
        axisLine: {
          lineStyle: {
            color: '#CBD5E1',
          },
        },
      },
      series: [
        {
          name: 'Emotions',
          type: 'radar',
          data: [
            {
              value: emotions.map(e => e.value),
              name: 'Current Emotions',
              itemStyle: {
                color: '#059669',
              },
              areaStyle: {
                color: 'rgba(5, 150, 105, 0.2)',
              },
              lineStyle: {
                color: '#059669',
                width: 2,
              },
            },
          ],
          symbol: 'circle',
          symbolSize: 6,
          label: {
            show: false,
          },
        },
      ],
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
    };
  }, [emotionData]);

  const dominantEmotion = useMemo(() => {
    if (!emotionData) return null;

    const emotions = [
      { name: 'Happy', value: emotionData.happy, emoji: '😊' },
      { name: 'Sad', value: emotionData.sad, emoji: '😢' },
      { name: 'Angry', value: emotionData.angry, emoji: '😠' },
      { name: 'Fearful', value: emotionData.fearful, emoji: '😨' },
      { name: 'Surprised', value: emotionData.surprised, emoji: '😲' },
      { name: 'Neutral', value: emotionData.neutral, emoji: '😐' },
    ];

    return emotions.reduce((max, emotion) => 
      emotion.value > max.value ? emotion : max
    );
  }, [emotionData]);

  if (!emotionData) {
    return (
      <Card className={`emotion-meter ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Emotion Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <p className="text-sm">Start a session to see emotion analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`emotion-meter ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Emotion Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dominant emotion display */}
        {dominantEmotion && (
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="text-2xl mb-1">{dominantEmotion.emoji}</div>
            <p className="text-sm font-medium">{dominantEmotion.name}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round(dominantEmotion.value * 100)}% intensity
            </p>
          </div>
        )}

        {/* Radar chart */}
        <div className="h-48">
          {chartOptions && (
            <ReactEChartsCore
              echarts={echarts}
              option={chartOptions}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          )}
        </div>

        {/* Emotion bars */}
        <div className="space-y-2">
          {[
            { name: 'Happy', value: emotionData.happy, color: 'bg-green-500', emoji: '😊' },
            { name: 'Sad', value: emotionData.sad, color: 'bg-blue-500', emoji: '😢' },
            { name: 'Angry', value: emotionData.angry, color: 'bg-red-500', emoji: '😠' },
            { name: 'Fearful', value: emotionData.fearful, color: 'bg-purple-500', emoji: '😨' },
            { name: 'Surprised', value: emotionData.surprised, color: 'bg-yellow-500', emoji: '😲' },
            { name: 'Neutral', value: emotionData.neutral, color: 'bg-gray-500', emoji: '😐' },
          ].map((emotion) => (
            <div key={emotion.name} className="flex items-center gap-2 text-xs">
              <span className="text-sm">{emotion.emoji}</span>
              <span className="w-12 text-right">{emotion.name}</span>
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${emotion.color}`}
                  style={{ width: `${emotion.value * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">
                {Math.round(emotion.value * 100)}%
              </span>
            </div>
          ))}
        </div>

        {/* Real-time indicator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span className="text-xs text-muted-foreground">Live Analysis</span>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};