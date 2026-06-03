/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { User, Stethoscope, ChevronRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  onSelectRole: (role: UserRole) => void;
}

export default function RoleSelection({ onSelectRole }: Props) {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif italic text-white uppercase tracking-[0.2em] mb-4">
            Derm.Vision
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Select Authorization Tier</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RoleCard 
            role={UserRole.PATIENT}
            title="Patient Portal"
            description="Access AI diagnostics, track symptoms, and manage personal health records."
            icon={<User size={32} />}
            onClick={() => onSelectRole(UserRole.PATIENT)}
          />
          <RoleCard 
            role={UserRole.DOCTOR}
            title="Doctor Portal"
            description="Authorized medical review, patient triage, and clinical analysis tools."
            icon={<Stethoscope size={32} />}
            onClick={() => onSelectRole(UserRole.DOCTOR)}
            variant="emerald"
          />
          <RoleCard 
            role={UserRole.ADMIN}
            title="Admin Protocol"
            description="System management, doctor registration, and clinical activity oversight."
            icon={<ShieldCheck size={32} />}
            onClick={() => onSelectRole(UserRole.ADMIN)}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, title, description, icon, onClick, variant = "default" }: any) {
  const isEmerald = variant === "emerald";
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group h-full bg-brand-card border border-brand-border rounded-3xl p-8 text-left transition-all hover:border-${isEmerald ? 'emerald' : 'slate'}-500/50 flex flex-col overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${isEmerald ? 'emerald' : 'slate'}-500/5 blur-[100px] -mr-16 -mt-16 group-hover:bg-${isEmerald ? 'emerald' : 'slate'}-500/10 transition-all`} />
      
      <div className={`w-16 h-16 rounded-2xl bg-${isEmerald ? 'emerald' : 'emerald'}-500/10 border border-${isEmerald ? 'emerald' : 'emerald'}-500/20 flex items-center justify-center mb-8 text-emerald-500 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 group-hover:text-emerald-400 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
        {description}
      </p>

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 group-hover:text-white transition-colors">
        Initialize Access Protocol <ChevronRight size={14} />
      </div>
    </motion.button>
  );
}
