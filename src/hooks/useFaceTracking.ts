import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export interface FaceLandmarks {
  keypoints: Array<{
    x: number;
    y: number;
    z?: number;
    name?: string;
  }>;
  box: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
  };
}

export interface FaceExpressions {
  eyesOpen: number;
  mouthOpen: number;
  smiling: number;
  eyebrowsRaised: number;
  headTilt: number;
  headTurn: number;
}

interface FaceTrackingHook {
  landmarks: FaceLandmarks | null;
  expressions: FaceExpressions | null;
  isModelLoaded: boolean;
  error: string | null;
  processFrame: (imageData: ImageData) => Promise<void>;
  initializeModel: () => Promise<void>;
}

export const useFaceTracking = (): FaceTrackingHook => {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [expressions, setExpressions] = useState<FaceExpressions | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);

  const initializeModel = useCallback(async () => {
    try {
      setError(null);
      console.log('🤖 Loading TensorFlow.js face detection model...');

      // Initialize TensorFlow.js
      await tf.ready();
      console.log('✅ TensorFlow.js ready');

      // Load the MediaPipe FaceMesh model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs' as const,
        maxFaces: 1,
        refineLandmarks: true,
      };

      detectorRef.current = await faceLandmarksDetection.createDetector(model, detectorConfig);
      setIsModelLoaded(true);
      console.log('✅ Face detection model loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load face detection model';
      setError(errorMessage);
      console.error('❌ Face tracking error:', errorMessage);
    }
  }, []);

  const calculateExpressions = useCallback((landmarks: FaceLandmarks): FaceExpressions => {
    const { keypoints } = landmarks;
    
    // Helper function to get keypoint by index
    const getPoint = (index: number) => keypoints[index];
    
    // Calculate eye openness (distance between upper and lower eyelid)
    const leftEyeTop = getPoint(159);
    const leftEyeBottom = getPoint(145);
    const rightEyeTop = getPoint(386);
    const rightEyeBottom = getPoint(374);
    
    const leftEyeHeight = Math.abs(leftEyeTop.y - leftEyeBottom.y);
    const rightEyeHeight = Math.abs(rightEyeTop.y - rightEyeBottom.y);
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
    const eyesOpen = Math.min(avgEyeHeight / 20, 1); // Normalize to 0-1

    // Calculate mouth openness
    const mouthTop = getPoint(13);
    const mouthBottom = getPoint(14);
    const mouthHeight = Math.abs(mouthTop.y - mouthBottom.y);
    const mouthOpen = Math.min(mouthHeight / 30, 1); // Normalize to 0-1

    // Calculate smile (corners of mouth vs center)
    const mouthLeft = getPoint(61);
    const mouthRight = getPoint(291);
    const mouthCenter = getPoint(13);
    const smileIntensity = (mouthLeft.y + mouthRight.y) / 2 - mouthCenter.y;
    const smiling = Math.max(0, Math.min(smileIntensity / 10, 1)); // Normalize to 0-1

    // Calculate eyebrow position
    const leftBrow = getPoint(70);
    const rightBrow = getPoint(107);
    const noseBridge = getPoint(168);
    const browHeight = (leftBrow.y + rightBrow.y) / 2 - noseBridge.y;
    const eyebrowsRaised = Math.max(0, Math.min(-browHeight / 30, 1)); // Normalize to 0-1

    // Calculate head pose
    const noseBase = getPoint(2);
    const leftCheek = getPoint(234);
    const rightCheek = getPoint(454);
    
    const headTurn = (rightCheek.x - leftCheek.x) / 200; // -1 to 1
    const headTilt = (noseBase.x - (leftCheek.x + rightCheek.x) / 2) / 100; // -1 to 1

    return {
      eyesOpen,
      mouthOpen,
      smiling,
      eyebrowsRaised,
      headTilt: Math.max(-1, Math.min(1, headTilt)),
      headTurn: Math.max(-1, Math.min(1, headTurn)),
    };
  }, []);

  const processFrame = useCallback(async (imageData: ImageData) => {
    if (!detectorRef.current || !isModelLoaded) {
      return;
    }

    try {
      // Create tensor from ImageData
      const tensor = tf.browser.fromPixels(imageData);
      
      // Detect faces
      const faces = await detectorRef.current.estimateFaces(tensor);
      
      // Clean up tensor
      tensor.dispose();

      if (faces.length > 0) {
        const face = faces[0];
        
        // Convert face detection result to our format
        const faceLandmarks: FaceLandmarks = {
          keypoints: face.keypoints.map(kp => ({
            x: kp.x,
            y: kp.y,
            z: kp.z,
            name: kp.name,
          })),
          box: {
            xMin: face.box.xMin,
            yMin: face.box.yMin,
            xMax: face.box.xMax,
            yMax: face.box.yMax,
            width: face.box.width,
            height: face.box.height,
          },
        };

        setLandmarks(faceLandmarks);
        
        // Calculate facial expressions
        const faceExpressions = calculateExpressions(faceLandmarks);
        setExpressions(faceExpressions);
      } else {
        // No face detected
        setLandmarks(null);
        setExpressions(null);
      }
    } catch (err) {
      console.warn('⚠️  Face tracking frame processing error:', err);
      // Don't set error state for individual frame failures
    }
  }, [isModelLoaded, calculateExpressions]);

  // Initialize model on mount
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return {
    landmarks,
    expressions,
    isModelLoaded,
    error,
    processFrame,
    initializeModel,
  };
};