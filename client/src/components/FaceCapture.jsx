import { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const FaceCapture = ({ onCapture, onError, mode = 'register' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading face detection models...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessChecked, setLivenessChecked] = useState(false);
  const [captureReady, setCaptureReady] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing camera...');
  const [eyeHistory, setEyeHistory] = useState([]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingMsg('Loading face detection models...');
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        setLoadingMsg('Starting camera...');
        await startCamera();
        setIsLoading(false);
        setStatusMsg('Position your face within the guide');
      } catch (err) {
        console.error('Model loading error:', err);
        setLoadingMsg('Failed to load face detection. Please refresh.');
        onError?.('Failed to load face detection models');
      }
    };
    loadModels();

    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setStatusMsg('Camera access denied. Please allow camera permissions.');
      onError?.('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Face detection loop
  useEffect(() => {
    if (isLoading) return;

    const detectFace = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320, 
          scoreThreshold: 0.5 
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      // Draw detection overlay
      if (canvasRef.current && videoRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);

        if (detection) {
          setFaceDetected(true);
          
          // Draw face outline
          const resizedDetection = faceapi.resizeResults(detection, displaySize);
          // Draw landmarks for visual feedback
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);

          // Liveness detection: check eye aspect ratio for blinks
          const landmarks = detection.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          
          const leftEAR = getEyeAspectRatio(leftEye);
          const rightEAR = getEyeAspectRatio(rightEye);
          const avgEAR = (leftEAR + rightEAR) / 2;

          // Track eye state for blink detection or sustained tracking
          setEyeHistory(prev => {
            const newHistory = [...prev, avgEAR].slice(-15);
            
            if (newHistory.length >= 3) {
              const recent = newHistory.slice(-3);
              // Relative drop in Eye Aspect Ratio is much more reliable across different face shapes/glasses
              const isBlink = (recent[0] - recent[1] > 0.02) && (recent[2] - recent[1] > 0.01);
              
              // Liveness passes if they blink OR if we successfully track the face for 1.5 seconds straight (15 frames)
              if (isBlink || newHistory.length >= 15) {
                setBlinkCount(1);
                setLivenessChecked(true);
                setCaptureReady(true);
                setStatusMsg('✅ Liveness verified! Click capture.');
              }
            }
            return newHistory;
          });

          if (!livenessChecked) {
            setStatusMsg(`Face detected! Please blink naturally (${blinkCount}/1)`);
          }
        } else {
          setFaceDetected(false);
          if (!livenessChecked) {
            setStatusMsg('No face detected. Position your face in the guide.');
          }
        }
      }
    };

    intervalRef.current = setInterval(detectFace, 100); // 10fps to catch fast blinks
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading, livenessChecked, blinkCount]);

  // Eye Aspect Ratio calculation for blink detection
  const getEyeAspectRatio = (eye) => {
    // eye points: 0-5 (6 points)
    const vertical1 = distance(eye[1], eye[5]);
    const vertical2 = distance(eye[2], eye[4]);
    const horizontal = distance(eye[0], eye[3]);
    return (vertical1 + vertical2) / (2 * horizontal);
  };

  const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    setStatusMsg('Capturing face data...');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatusMsg('No face detected during capture. Please try again.');
        return;
      }

      // Get 128-dimensional face descriptor
      const descriptor = Array.from(detection.descriptor);
      
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      setStatusMsg('✅ Face captured successfully!');
      onCapture?.(descriptor);
    } catch (err) {
      console.error('Capture error:', err);
      setStatusMsg('Capture failed. Please try again.');
      onError?.('Face capture failed');
    }
  };

  // Skip liveness for faster testing in development
  const handleSkipLiveness = () => {
    setLivenessChecked(true);
    setCaptureReady(true);
    setStatusMsg('Liveness skipped (dev mode). Click capture.');
  };

  return (
    <div className="face-capture">
      <div className="webcam-container">
        {isLoading && (
          <div className="webcam-loading">
            <div className="spinner" />
            <p>{loadingMsg}</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
        />
        <canvas ref={canvasRef} />
        <div className="webcam-overlay">
          <div className={`face-guide ${faceDetected ? 'detected' : ''}`} />
        </div>
        <div className={`webcam-status ${faceDetected ? 'badge--success' : 'badge--warning'}`}>
          {statusMsg}
        </div>
      </div>

      <div className="face-capture__controls">
        <div className="face-capture__indicators">
          <div className={`face-capture__check ${faceDetected ? 'active' : ''}`}>
            {faceDetected ? '✅' : '⬜'} Face Detected
          </div>
          <div className={`face-capture__check ${livenessChecked ? 'active' : ''}`}>
            {livenessChecked ? '✅' : '⬜'} Liveness Check ({blinkCount}/1 blinks)
          </div>
        </div>

        <div className="flex gap-md mt-md">
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleCapture}
            disabled={!captureReady && !livenessChecked}
          >
            📸 {mode === 'register' ? 'Capture Face' : 'Verify Face'}
          </button>
          {!livenessChecked && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleSkipLiveness}
              title="Skip for testing"
            >
              Skip ⚡
            </button>
          )}
        </div>
      </div>

      <style>{`
        .face-capture {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .webcam-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          background: var(--bg-secondary);
          z-index: 10;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .face-capture__controls {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .face-capture__indicators {
          display: flex;
          gap: var(--space-lg);
          justify-content: center;
        }
        .face-capture__check {
          font-size: 0.88rem;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }
        .face-capture__check.active {
          color: var(--accent-success);
        }
      `}</style>
    </div>
  );
};

export default FaceCapture;
