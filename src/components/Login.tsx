/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, ChevronRight, Lock, Key } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface Props {
  role: UserRole;
  onLogin: (user: UserProfile) => void;
  onSignup: (user: UserProfile) => void;
  users: UserProfile[];
  onBack: () => void;
}

export default function Login({ role, onLogin, onSignup, users, onBack }: Props) {
  const [isSignup, setIsSignup] = useState(false);
  const isAdmin = role === UserRole.ADMIN;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'info' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!/^\d{5}$/.test(pin)) {
      setMessage({ text: "PIN must be exactly 5 digits.", type: 'error' });
      return;
    }

    if (isSignup && !isAdmin) {
      const existingUser = users.find(u => u.phone === phone);
      if (existingUser) {
        setMessage({ text: "Identification already exists. Please login instead.", type: 'error' });
        return;
      }
      onSignup({ name, phone, pin, role });
    } else {
      const user = users.find(u => u.phone === phone && u.role === role);
      if (!user) {
        setMessage({ text: `${role === UserRole.DOCTOR ? 'Medical ID' : role === UserRole.ADMIN ? 'Admin Identifier' : 'User profile'} not found.`, type: 'error' });
        return;
      }
      if (user.pin !== pin) {
        setMessage({ text: "Incorrect PIN. Verification failed.", type: 'error' });
        return;
      }
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6">
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-brand-card border border-brand-border rounded-3xl p-10 shadow-2xl relative overflow-hidden"
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-slate-600 hover:text-white transition-colors"
        >
          <ChevronRight className="rotate-180" size={20} />
        </button>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            {role === UserRole.PATIENT ? <Lock className="text-emerald-500" size={32} /> : <Key className="text-emerald-500" size={32} />}
          </div>
          <h1 className="text-2xl font-serif italic text-white uppercase tracking-widest text-center">
            {isSignup ? "Create Protocol" : "Secure Entry"}
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-2">
            {role === UserRole.DOCTOR ? "Clinician" : role === UserRole.ADMIN ? "Network Admin" : "Patient"} {isSignup ? "Registration" : "Portal"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-xl text-xs font-medium border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && !isAdmin && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block ml-1">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-brand-black border border-brand-border rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block ml-1">{role === UserRole.ADMIN ? "Admin Identifier" : "Mobile Identification"}</label>
            <div className="relative group">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={role === UserRole.ADMIN ? "IDENTIFIER_CODE" : "+1 (555) 000-0000"}
                className="w-full bg-brand-black border border-brand-border rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block ml-1">5-Digit Access Code</label>
            <div className="relative group">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="password"
                required
                maxLength={5}
                pattern="\d{5}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="*****"
                className="w-full bg-brand-black border border-brand-border rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700 tracking-[0.5em]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isSignup ? "Initialize Account" : "Authorize Access"}
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </form>

        {!isAdmin && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage(null);
              }}
              className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-emerald-500 transition-colors"
            >
              {isSignup ? "Already have a key? Login" : "No account found? Register clinical ID"}
            </button>
          </div>
        )}

        <footer className="mt-10 pt-8 border-t border-brand-border text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-tighter">
            System status: <span className="text-emerald-500 font-bold">Encrypted</span>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
