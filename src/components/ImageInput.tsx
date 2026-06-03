/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onImageCaptured: (base64: string, mimeType: string) => void;
  onClear: () => void;
}

export default function ImageInput({ onImageCaptured, onClear }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageCaptured(base64.split(',')[1], file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setPreview(base64);
      onImageCaptured(base64.split(',')[1], 'image/jpeg');
      stopCamera();
    }
  };

  const clear = () => {
    setPreview(null);
    onClear();
  };

  return (
    <div className="w-full" id="image-input-container">
      <AnimatePresence mode="wait">
        {!preview && !isCameraActive && (
          <motion.div 
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                className="flex flex-col items-center justify-center gap-3 p-8 border border-brand-border bg-brand-hover rounded-2xl hover:border-emerald-500/50 hover:bg-[#1f1f24] transition-all group"
                id="camera-btn"
              >
                <div className="bg-brand-black p-3 rounded-xl border border-brand-border group-hover:text-emerald-400 transition-colors">
                  <Camera size={24} />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Capture</span>
              </button>
              
              <label className="flex flex-col items-center justify-center gap-3 p-8 border border-brand-border bg-brand-hover rounded-2xl hover:border-emerald-500/50 hover:bg-[#1f1f24] transition-all group cursor-pointer text-center">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="bg-brand-black p-3 rounded-xl border border-brand-border group-hover:text-emerald-400 transition-colors">
                  <ImageIcon size={24} />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Upload File</span>
              </label>
            </div>
          </motion.div>
        )}

        {isCameraActive && (
          <motion.div 
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-lg mx-auto border border-brand-border"
          >
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
              <button 
                onClick={capturePhoto}
                className="bg-emerald-500 text-black font-bold py-2.5 px-8 rounded uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-400 transition-colors"
              >
                Freeze Frame
              </button>
              <button 
                onClick={stopCamera}
                className="bg-brand-hover text-white p-2.5 rounded border border-brand-border shadow-xl hover:bg-brand-card transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {preview && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden border border-brand-border max-w-sm mx-auto shadow-2xl"
          >
            <img src={preview} alt="Skin Condition Preview" className="w-full h-auto object-cover max-h-[300px]" />
            <button 
              onClick={clear}
              className="absolute top-3 right-3 bg-brand-black/80 text-white p-2 rounded border border-brand-border hover:bg-brand-black transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
