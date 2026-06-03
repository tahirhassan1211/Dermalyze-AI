/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function Disclaimer() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-card border border-brand-border p-5 mb-8 rounded-xl"
      id="medical-disclaimer"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Info className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-1">
            Clinical Disclaimer
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            This analytical engine is designed for educational research and preliminary screening support. It is not a substitute for clinical diagnosis by a board-certified dermatologist. System findings require manual verification through standard diagnostic protocols.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
