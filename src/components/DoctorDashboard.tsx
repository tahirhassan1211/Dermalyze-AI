/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  ExternalLink,
  ClipboardList,
  Send,
  Shield,
  Reply
} from 'lucide-react';
import { ConsultationRequest, UserProfile, UserMessage } from '../types';

interface Props {
  doctor: UserProfile;
  consultations: ConsultationRequest[];
  onReview: (id: string, response: ConsultationRequest['doctorResponse']) => void;
  messages: UserMessage[];
  admins: UserProfile[];
  onSendMessage: (text: string, recipientId: string | string[]) => void;
}

export default function DoctorDashboard({ 
  doctor, 
  consultations, 
  onReview, 
  messages, 
  admins, 
  onSendMessage 
}: Props) {
  const [activeView, setActiveView] = useState<'cases' | 'messages'>('cases');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msgRecipientId, setMsgRecipientId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  
  const [feedback, setFeedback] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [medicines, setMedicines] = useState('');
  
  const selected = consultations.find(c => c.id === selectedId);
  const pending = consultations.filter(c => c.status === 'PENDING');
  const reviewed = consultations.filter(c => c.status === 'REVIEWED');

  const handleFinalize = () => {
    if (!selectedId || !feedback) {
      alert("Please provide at least the primary clinical feedback.");
      return;
    }
    const responseData = {
      feedback,
      precautions,
      medicines,
      timestamp: new Date().toISOString()
    };
    onReview(selectedId, responseData);
    setFeedback('');
    setPrecautions('');
    setMedicines('');
    setSelectedId(null);
  };

  const handleSend = () => {
    if (!msgRecipientId || !msgText) return;
    onSendMessage(msgText, msgRecipientId);
    setMsgText('');
    setMsgRecipientId(null);
  };

  return (
    <div className="min-h-screen bg-brand-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif italic text-white uppercase tracking-tight">
              Dr. {doctor.name}
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Authorized Clinical Dashboard · Multi-Spectral Analytics</p>
          </div>
          
          <div className="flex gap-4">
            <StatCard label="Live Triage" value={pending.length.toString()} icon={<MessageSquare size={16} />} color="text-emerald-500" />
            <StatCard label="Messages" value={messages.filter(m => m.recipientId === doctor.phone).length.toString()} icon={<Send size={16} />} color="text-slate-500" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-brand-border h-12">
          <button 
            onClick={() => setActiveView('cases')}
            className={`px-8 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${activeView === 'cases' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-600 hover:text-white'}`}
          >
            Clinical Cases
          </button>
          <button 
            onClick={() => setActiveView('messages')}
            className={`px-8 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${activeView === 'messages' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-600 hover:text-white'}`}
          >
            Secure Comms
          </button>
        </div>

        {activeView === 'cases' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* List */}
            <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="PROBE PATIENT ID OR NAME..."
                className="w-full bg-brand-card border border-brand-border rounded-xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest uppercase text-white focus:border-emerald-500/50 outline-none transition-all"
              />
            </div>

            <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
               <div className="p-4 border-b border-brand-border bg-brand-black/50">
                 <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Incoming Consultations</h2>
               </div>
               
               <div className="divide-y divide-brand-border max-h-[600px] overflow-y-auto custom-scrollbar">
                 {consultations.length === 0 ? (
                   <div className="p-12 text-center space-y-4">
                     <Clock className="mx-auto text-slate-700" size={32} />
                     <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Standard Monitoring Active - No Pending Requests</p>
                   </div>
                 ) : (
                   consultations.map(c => (
                     <button 
                       key={c.id}
                       onClick={() => setSelectedId(c.id)}
                       className={`w-full p-6 text-left hover:bg-brand-hover transition-all flex items-center justify-between group ${selectedId === c.id ? 'bg-brand-hover border-l-2 border-emerald-500' : ''}`}
                     >
                       <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'PENDING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                           <h3 className="text-sm font-bold text-white uppercase tracking-tight">{c.patientName}</h3>
                         </div>
                         <p className="text-[10px] text-slate-500 font-mono uppercase">Applied: {new Date(c.timestamp).toLocaleString()}</p>
                       </div>
                       <ChevronRight size={18} className={`text-slate-700 group-hover:text-white transition-all transform ${selectedId === c.id ? 'translate-x-1 text-emerald-500' : ''}`} />
                     </button>
                   ))
                 )}
               </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div 
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-8 sticky top-8"
                >
                  <div className="flex items-center justify-between border-b border-brand-border pb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Clinical Case Profile</p>
                      <h2 className="text-2xl font-serif italic text-white">{selected.patientName}</h2>
                    </div>
                    {selected.status === 'PENDING' ? (
                      <div className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-500 font-bold tracking-widest">AWAITING REVIEW</div>
                    ) : (
                      <div className="px-3 py-1 rounded bg-slate-500/10 border border-slate-500/20 text-[9px] text-slate-400 font-bold tracking-widest">ARCHIVED</div>
                    )}
                  </div>

                  {/* Diagnostic Data */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-brand-black p-4 rounded-xl border border-brand-border">
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-3">Diagnostic Image</p>
                      {selected.inputs.image ? (
                        <div className="aspect-square rounded-lg bg-brand-hover overflow-hidden border border-brand-border">
                           <img 
                             src={selected.inputs.image.data.startsWith('data:') ? selected.inputs.image.data : `data:${selected.inputs.image.mimeType};base64,${selected.inputs.image.data}`} 
                             alt="Clinical Scan" 
                             className="w-full h-full object-cover grayscale brightness-125 contrast-125 hover:grayscale-0 transition-all duration-500"
                           />
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg bg-brand-hover flex items-center justify-center text-slate-700 uppercase p-4 text-center">
                          <p className="text-[8px] font-bold tracking-widest">Image Source Unavailable</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-brand-black p-4 rounded-xl border border-brand-border">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Patient Description</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                          "{selected.inputs.text || 'No textual data provided for this case entry.'}"
                        </p>
                      </div>

                      <div className="bg-brand-black p-4 rounded-xl border border-brand-border">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Clinical Protocol</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] text-slate-500">
                             <span>Triage Priority</span>
                             <span className="text-emerald-500 font-bold">Standard</span>
                           </div>
                           <div className="w-full bg-brand-hover h-1 rounded-full overflow-hidden">
                             <div className="bg-emerald-500 h-full w-2/3"></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Findings */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">AI Diagnostics Synopsis</h4>
                    <div className="bg-brand-black p-6 rounded-2xl border border-brand-border text-slate-400 text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                      {selected.analysis.replace(/[#*]/g, '')}
                    </div>
                  </div>

                  {/* Doctor Response Form */}
                  <div className="pt-6 border-t border-brand-border space-y-6">
                    <h4 className="text-[10px] uppercase tracking-widest text-white font-bold">Professional Clinical Response</h4>
                    
                    {selected.status === 'PENDING' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Clinical Analysis & Feedback</label>
                          <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Type your professional assessment..."
                            className="w-full bg-brand-black border border-brand-border rounded-xl p-4 text-xs text-white focus:border-emerald-500/50 outline-none transition-all min-h-[100px] resize-none"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Recommended Precautions</label>
                            <textarea 
                              value={precautions}
                              onChange={(e) => setPrecautions(e.target.value)}
                              placeholder="Prevention measures..."
                              className="w-full bg-brand-black border border-brand-border rounded-xl p-4 text-xs text-white focus:border-emerald-500/50 outline-none transition-all min-h-[80px] resize-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Suggested Medications</label>
                            <textarea 
                              value={medicines}
                              onChange={(e) => setMedicines(e.target.value)}
                              placeholder="Proposed clinical path..."
                              className="w-full bg-brand-black border border-brand-border rounded-xl p-4 text-xs text-white focus:border-emerald-500/50 outline-none transition-all min-h-[80px] resize-none"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleFinalize}
                          className="w-full bg-emerald-500 text-black py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98]"
                        >
                          Submit Clinical Response
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-brand-black rounded-xl border border-brand-border">
                          <p className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold mb-2">My Analysis</p>
                          <p className="text-xs text-slate-400">{selected.doctorResponse?.feedback}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-brand-black rounded-xl border border-brand-border">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Precautions</p>
                            <p className="text-xs text-slate-400">{selected.doctorResponse?.precautions || 'None specified.'}</p>
                          </div>
                          <div className="p-4 bg-brand-black rounded-xl border border-brand-border">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Medicines</p>
                            <p className="text-xs text-slate-400">{selected.doctorResponse?.medicines || 'None specified.'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </motion.div>
              ) : (
                <div className="h-[600px] bg-brand-card border border-brand-border border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-700 gap-4 opacity-70">
                  <ClipboardList size={48} strokeWidth={1} />
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest font-bold">Analytical Subject Selected</p>
                    <p className="text-[10px] mt-2 italic">Select a patient case to begin professional clinical review</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
               <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Secure Transmissions</h2>
               <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden divide-y divide-brand-border max-h-[600px] overflow-y-auto custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="p-12 text-center text-slate-700 italic text-[10px] uppercase tracking-widest">No secure transmissions logged.</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`p-6 transition-all ${msg.senderId === doctor.phone ? 'bg-brand-black/20' : 'bg-brand-hover/10'}`}>
                        <div className="flex justify-between mb-2">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.senderId === doctor.phone ? 'text-slate-500' : 'text-emerald-500'}`}>
                             {msg.senderId === doctor.phone ? 'OUTBOUND' : `FROM: ${msg.senderName}`}
                           </span>
                           <span className="text-[9px] font-mono text-slate-600">{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic leading-relaxed mb-4">"{msg.text}"</p>
                        <div className="flex justify-between items-center">
                           <span className="text-[8px] text-slate-700 uppercase font-bold tracking-widest">
                             {msg.senderId === doctor.phone ? `RECIPIENT_ID: ${msg.recipientId.slice(-4)}` : `ROUTE: MD_SECURE_CHANNEL`}
                           </span>
                           {msg.senderId !== doctor.phone && (
                             <button 
                               onClick={() => {
                                 setMsgRecipientId(msg.senderId);
                                 setMsgText(`Replying to: "${msg.text.substring(0, 30)}..." - `);
                               }}
                               className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-emerald-500 hover:text-white transition-colors"
                             >
                               <Reply size={10} /> Reply
                             </button>
                           )}
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-6 sticky top-8">
                <h3 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Compose Transmission</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-slate-600">Administrative Authority</label>
                    <select 
                      value={msgRecipientId || ''}
                      onChange={(e) => setMsgRecipientId(e.target.value)}
                      className="w-full bg-brand-black border border-brand-border p-3 rounded text-[10px] text-white uppercase font-bold tracking-widest outline-none focus:border-emerald-500"
                    >
                      <option value="">SELECT AUTHORITY...</option>
                      {admins.map(a => (
                        <option key={a.phone} value={a.phone}>
                          {a.isAdminPrimary ? 'PRIMARY COMMAND (HQ)' : `ADMIN: ${a.name.toUpperCase()}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea 
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="ENTER SECURE MESSAGE..."
                    className="w-full bg-brand-black border border-brand-border rounded-xl p-4 text-[10px] text-white uppercase focus:border-emerald-500 outline-none min-h-[150px] resize-none"
                  />
                  <button 
                    onClick={handleSend}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-black py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all"
                  >
                    <Send size={12} /> Encrypt & Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl px-6 py-4 flex items-center gap-4 min-w-[160px]">
      <div className={`w-8 h-8 rounded bg-brand-black border border-brand-border flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold leading-none mb-1">{label}</p>
        <p className={`text-xl font-mono font-bold leading-none ${color}`}>{value}</p>
      </div>
    </div>
  );
}
