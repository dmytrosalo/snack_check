import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Camera as CameraIcon, RotateCcw, Check } from 'lucide-react';
import { resizeImage } from '../lib/imageUtils';

export default function Camera({ onCapture, onClose }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // back camera
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError(t('camera.error'));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = async () => {
    if (capturedImage && !isProcessing) {
      setIsProcessing(true);
      try {
        const resized = await resizeImage(capturedImage);
        onCapture(resized);
        onClose();
      } catch (err) {
        console.error('Failed to process image:', err);
        // Fallback to original if resize fails
        onCapture(capturedImage);
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white"
        >
          <X size={24} />
        </button>
        <span className="text-white font-medium">{t('camera.title')}</span>
        <button
          onClick={toggleCamera}
          className="p-2 rounded-full bg-white/10 text-white"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white text-center p-4">
            <div>
              <p className="mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-emerald-500 rounded-lg"
              >
                {t('camera.tryAgain')}
              </button>
            </div>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-6 safe-bottom flex justify-center gap-8">
        {capturedImage ? (
          <>
            <button
              onClick={retake}
              className="p-4 rounded-full bg-white/10 text-white"
            >
              <RotateCcw size={32} />
            </button>
            <button
              onClick={confirm}
              disabled={isProcessing}
              className="p-4 rounded-full bg-emerald-500 text-white disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={32} />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full border-4 border-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
}
