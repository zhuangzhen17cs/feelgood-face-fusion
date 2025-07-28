# UnTherapy - AI-Powered Emotional Support Chatbot

![UnTherapy Logo](https://github.com/user-attachments/assets/untherapy-preview.png)

UnTherapy is a revolutionary AI-powered emotional support platform that provides real-time emotion analysis and personalized therapeutic guidance through interactive avatars.

## ✨ Features

### 🎭 Real-Time Avatar System
- **User Avatar**: Live cartoon representation with face tracking and expression mirroring
- **AI Therapist Avatar**: Responsive Dr. Aria who reacts to your emotional state
- **Smooth Animations**: 60fps rendering with optimized performance

### 🧠 Advanced Emotion Analysis
- **Face Detection**: TensorFlow.js powered facial landmark detection
- **Expression Recognition**: Real-time analysis of 6+ emotional states
- **Visual Feedback**: Interactive emotion meter with live radar charts

### 🔊 Voice & Communication
- **WebRTC Integration**: Real-time audio capture and processing
- **WebSocket Communication**: Live data streaming to backend services
- **Session Management**: Seamless start/stop controls

### 🎨 Therapeutic Design
- **Calming Interface**: Carefully crafted color palette for emotional wellness
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant design with semantic HTML

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebRTC support
- Camera permissions for face tracking

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd untherapy-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080`

### Backend Integration

The app expects a WebSocket server at `ws://localhost:3001`. Update the connection URL in `src/hooks/useWebSocket.ts`:

```typescript
const { emotionData, isConnected } = useWebSocket('ws://your-backend-url');
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── UserAvatar.tsx       # User's cartoon avatar with face tracking
│   ├── AIAvatar.tsx         # AI therapist with emotional responses
│   ├── EmotionMeter.tsx     # Real-time emotion visualization
│   ├── SessionControls.tsx  # Session management controls
│   └── UnTherapyLayout.tsx  # Main layout orchestrator
├── hooks/
│   ├── useWebSocket.ts      # WebSocket communication hook
│   ├── useCamera.ts         # Camera capture and management
│   └── useFaceTracking.ts   # TensorFlow.js face detection
└── pages/
    └── Index.tsx            # Main application entry
```

### Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **AI/ML**: TensorFlow.js + MediaPipe FaceMesh
- **Charts**: ECharts for emotion visualization
- **Communication**: Socket.IO for real-time data
- **UI Components**: Radix UI (shadcn/ui)

## 🎯 Core Hooks

### WebSocket Hook
```typescript
const {
  emotionData,      // Current emotion analysis
  chatMessages,     // Chat history
  isConnected,      // Connection status
  connect,          // Establish connection
  disconnect,       // Close connection
  sendMessage,      // Send text message
  sendAudioData     // Send audio for analysis
} = useWebSocket('ws://localhost:3001');
```

### Camera Hook
```typescript
const {
  videoRef,         // Video element ref
  canvasRef,        // Canvas for processing
  isStreaming,      // Streaming status
  error,            // Camera errors
  startCamera,      // Initialize camera
  stopCamera,       // Stop camera stream
  captureFrame      // Get current frame data
} = useCamera();
```

### Face Tracking Hook (Demo Mode)
```typescript
const {
  landmarks,        // Simulated facial landmark coordinates
  expressions,      // Calculated expressions (realistic simulation)
  isModelLoaded,    // Model ready status
  error,            // Tracking errors
  processFrame,     // Process video frame (demo mode)
  initializeModel   // Initialize demo system
} = useFaceTracking();
```

**Note:** The current implementation uses simulated face tracking for demo purposes. To enable real face tracking, you'll need to:

1. Install TensorFlow.js dependencies:
   ```bash
   npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection
   ```

2. Replace the demo implementation in `useFaceTracking.ts` with actual MediaPipe integration

## 🎨 Design System

### Color Palette
```css
/* Therapeutic colors in HSL format */
--primary: 180 35% 45%;        /* Calming teal */
--primary-glow: 180 45% 75%;   /* Soft teal glow */
--accent: 250 25% 88%;         /* Gentle lavender */
--background: 200 30% 98%;     /* Soft blue-white */
```

### Animation Classes
```css
.therapy-pulse      /* Gentle pulsing animation */
.animate-breathing  /* Subtle breathing effect */
.session-button     /* Therapeutic button styling */
.avatar-container   /* Avatar container with glow */
```

## 📡 Backend Integration

### Expected WebSocket Events

#### Incoming Events
```typescript
// Emotion analysis results
'emotion_update' → EmotionData

// AI chat responses
'ai_response' → { content: string, emotion?: string }

// Chat messages
'chat_message' → ChatMessage
```

#### Outgoing Events
```typescript
// User messages
'user_message' → { content: string, timestamp: number }

// Audio data for analysis
'audio_data' → { audio: string, timestamp: number }
```

### Data Interfaces
```typescript
interface EmotionData {
  happy: number;      // 0-1 confidence
  sad: number;
  angry: number;
  fearful: number;
  surprised: number;
  neutral: number;
  disgusted: number;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}
```

## 🔧 Configuration

### Environment Variables
```env
VITE_BACKEND_URL=ws://localhost:3001
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

### Performance Optimization
- Face tracking runs at max 20fps for optimal performance
- Canvas rendering is optimized with requestAnimationFrame
- TensorFlow.js models are cached for faster loading
- WebSocket reconnection with exponential backoff

## 🧪 Testing

### Manual Testing Checklist
- [ ] Camera permission request and handling
- [ ] Face detection accuracy across different lighting
- [ ] Avatar animation smoothness
- [ ] WebSocket connection resilience
- [ ] Responsive design on mobile devices
- [ ] Emotion analysis accuracy

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. Configure backend WebSocket URL
2. Enable HTTPS for camera access
3. Set up proper CORS headers
4. Configure CSP for TensorFlow.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** team for the face detection models
- **MediaPipe** for facial landmark technology
- **ECharts** for beautiful emotion visualizations
- **Radix UI** for accessible component primitives

---

<div align="center">
  <strong>Built with ❤️ for mental health and emotional wellness</strong>
  <br>
  <sub>UnTherapy • Your AI-powered emotional support companion</sub>
</div>