/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export default function TextInput({ value, onChange, onClear }: Props) {
  return (
    <div className="w-full" id="text-input-container">
      <div className="relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ENTER SYMPTOMS: ITCHING, BURNING, PAIN, ONSET DURATION..."
          className="w-full min-h-[160px] px-6 py-6 bg-brand-black border border-brand-border rounded-xl focus:border-emerald-500/50 outline-none transition-all text-slate-300 placeholder:text-slate-600 resize-none font-sans text-sm leading-relaxed tracking-tight"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="absolute right-4 bottom-4 text-slate-600 hover:text-red-500 transition-colors bg-brand-black p-1 rounded border border-brand-border shadow-lg"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex justify-between items-center bg-brand-hover p-2 rounded border border-brand-border">
        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 px-2 flex items-center gap-2">
          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div> Case Enrichment Length
        </span>
        <span className="text-[10px] font-mono font-bold text-emerald-500/80 px-2">
          {value.length.toString().padStart(4, '0')} CHARS
        </span>
      </div>
    </div>
  );
}
