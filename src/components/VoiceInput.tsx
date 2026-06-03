/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mic, Square, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onAudioCaptured: (base64: string, mimeType: string) => void;
  onClear: () => void;
}

export default function VoiceInput({ onAudioCaptured, onClear }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onAudioCaptured(base64.split(',')[1], 'audio/webm');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Audio recording error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clear = () => {
    setAudioUrl(null);
    setDuration(0);
    onClear();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full" id="voice-input-container">
      <div className="bg-brand-hover p-8 rounded-2xl border border-brand-border">
        <AnimatePresence mode="wait">
          {!audioUrl && !isRecording && (
            <motion.div 
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <button
                onClick={startRecording}
                className="bg-brand-black text-slate-300 w-20 h-20 rounded-full flex items-center justify-center border border-brand-border shadow-xl hover:border-emerald-500/50 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95 group"
                id="start-recording-btn"
              >
                <Mic size={32} strokeWidth={1.5} className="group-hover:animate-pulse" />
              </button>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Initialize Audio Input</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Symptoms, duration, progression</p>
              </div>
            </motion.div>
          )}

          {isRecording && (
            <motion.div 
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono text-3xl text-emerald-500 tracking-tighter">{formatTime(duration)}</span>
              </div>
              
              <button
                onClick={stopRecording}
                className="bg-red-500/10 text-red-500 border border-red-500/30 px-10 py-3 rounded uppercase tracking-widest text-xs font-bold hover:bg-red-500/20 transition-all"
                id="stop-recording-btn"
              >
                End Recording
              </button>
              
              <div className="w-full flex gap-1 items-center justify-center h-10">
                {[...Array(16)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, Math.random() * 32, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                    className="w-1 bg-emerald-500 opacity-40 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {audioUrl && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4 bg-brand-black p-4 rounded-xl border border-brand-border">
                <audio src={audioUrl} controls className="h-8 grow invert brightness-200" />
                <button 
                  onClick={clear}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Discard"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Signal Encoded</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
