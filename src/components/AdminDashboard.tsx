/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  MessageCircle, 
  Stethoscope, 
  BarChart3,
  Search,
  ExternalLink,
  ChevronRight,
  Send,
  User as UserIcon,
  Reply,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, ConsultationRequest, UserMessage, UserRole } from '../types';

interface Props {
  admin: UserProfile;
  users: UserProfile[];
  consultations: ConsultationRequest[];
  messages: UserMessage[];
  onRegisterDoctor: (doctor: UserProfile) => void;
  onRemoveDoctor: (phone: string) => void;
  onRegisterAdmin: (admin: UserProfile) => void;
  onSendMessage: (text: string, recipientId: string | string[]) => void;
}

export default function AdminDashboard({ 
  admin, 
  users, 
  consultations, 
  messages, 
  onRegisterDoctor, 
  onRemoveDoctor, 
  onRegisterAdmin,
  onSendMessage
}: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'messages'>('users');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [msgRecipientId, setMsgRecipientId] = useState<string | string[] | null>(null);
  const [msgText, setMsgText] = useState('');

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPin, setNewPin] = useState('');

  const isPrimary = admin.isAdminPrimary;
  const doctors = users.filter(u => u.role === UserRole.DOCTOR);
  const patients = users.filter(u => u.role === UserRole.PATIENT);
  const secondaryAdmins = users.filter(u => u.role === UserRole.ADMIN && !u.isAdminPrimary);

  const getConsultCount = (doctorId: string) => {
    return consultations.filter(c => c.doctorId === doctorId && c.status === 'REVIEWED').length;
  };

  const handleRegisterDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(newPin)) return alert("PIN must be 5 digits.");
    onRegisterDoctor({ name: newName, phone: newPhone, pin: newPin, role: UserRole.DOCTOR });
    resetForm();
  };

  const handleRegisterSecAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(newPin)) return alert("PIN must be 5 digits.");
    onRegisterAdmin({ name: newName, phone: newPhone, pin: newPin, role: UserRole.ADMIN, isAdminPrimary: false });
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setNewPin('');
    setShowAddDoc(false);
    setShowAddAdmin(false);
  };

  const handleSend = () => {
    if (!msgRecipientId || !msgText) return;
    if (Array.isArray(msgRecipientId) && msgRecipientId.length === 0) return;
    onSendMessage(msgText, msgRecipientId);
    setMsgText('');
    setMsgRecipientId(null);
  };

  const toggleRecipient = (id: string) => {
    setMsgRecipientId(prev => {
      const current = Array.isArray(prev) ? prev : [];
      if (current.includes(id)) return current.filter(i => i !== id);
      return [...current, id];
    });
  };

  return (
    <div className="flex-grow p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Doctors" value={doctors.length} icon={<Stethoscope size={16} />} color="text-emerald-500" />
          <StatCard label="Total Patients" value={patients.length} icon={<UserIcon size={16} />} color="text-emerald-500" />
          <StatCard label="Admins" value={secondaryAdmins.length + 1} icon={<Shield size={16} />} color="text-emerald-500" />
          <StatCard label="Total Consults" value={consultations.length} icon={<BarChart3 size={16} />} color="text-brand-accent-teal" />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-brand-border">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Registry" />
          <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} label="Clinical Activity" />
          <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="Comms Channel" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Human Resource Registry</h2>
                    {isPrimary && (
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddDoc(true)} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                          <UserPlus size={14} /> Add Doctor
                        </button>
                        <button onClick={() => setShowAddAdmin(true)} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                          <Shield size={14} /> Add Admin
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-brand-black/50 border-b border-brand-border">
                        <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                          <th className="p-6">Entity</th>
                          <th className="p-6">Role</th>
                          <th className="p-6">Identifier</th>
                          {isPrimary && <th className="p-6 text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {users.map(u => (
                          <tr key={u.phone} className="hover:bg-brand-hover/50 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.role === UserRole.DOCTOR ? 'bg-emerald-500/10 text-emerald-500' : u.role === UserRole.ADMIN ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                  {u.role === UserRole.DOCTOR ? <Stethoscope size={14} /> : u.role === UserRole.ADMIN ? <Shield size={14} /> : <UserIcon size={14} />}
                                </div>
                                <span className="text-sm font-bold text-white uppercase tracking-tight">{u.name} {u.isAdminPrimary && <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded ml-2">PRIMARY</span>}</span>
                              </div>
                            </td>
                            <td className="p-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">{u.role}</td>
                            <td className="p-6 text-xs text-slate-400 font-mono italic">{u.phone}</td>
                            {isPrimary && (
                              <td className="p-6 text-right">
                                {u.role === UserRole.DOCTOR && (
                                  <button onClick={() => onRemoveDoctor(u.phone)} className="text-red-500/50 hover:text-red-500 transition-colors p-2">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <h2 className="text-xl font-bold text-white uppercase tracking-wider">Medical Performance Index</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {doctors.map(doc => (
                       <button 
                         key={doc.phone} 
                         onClick={() => setSelectedDoctorId(doc.phone)}
                         className="w-full bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center justify-between text-left hover:border-emerald-500/50 hover:bg-brand-hover/30 transition-all group"
                       >
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                               <Stethoscope size={24} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white uppercase tracking-tight">Dr. {doc.name}</p>
                               <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Clinical ID: {doc.phone.slice(-4)}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-2xl font-mono text-emerald-500 font-bold">{getConsultCount(doc.phone)}</p>
                               <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest mt-1">Verified Actions</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                         </div>
                       </button>
                     ))}
                   </div>
                </motion.div>
              )}

               {activeTab === 'messages' && (
                <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <h2 className="text-xl font-bold text-white uppercase tracking-wider">Internal Comms Network</h2>
                   <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden divide-y divide-brand-border h-[600px] overflow-y-auto custom-scrollbar">
                     {messages.length === 0 ? (
                       <div className="p-12 text-center text-slate-700 italic uppercase text-[10px] tracking-widest">No secure transmissions logged.</div>
                     ) : (
                       messages.filter(m => (isPrimary ? (m.recipientId === 'PRIMARY_ADMIN' || m.senderId === admin.phone || m.recipientId === admin.phone) : (m.recipientId === admin.phone || m.senderId === admin.phone))).map(msg => (
                         <div key={msg.id} className={`p-6 space-y-3 transition-all ${msg.senderId === admin.phone ? 'bg-brand-black/20' : 'hover:bg-brand-hover/30'}`}>
                            <div className="flex justify-between">
                               <div className="flex flex-col">
                                 <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.senderId === admin.phone ? 'text-slate-500' : 'text-emerald-500'}`}>
                                   {msg.senderId === admin.phone ? 'OUTBOUND' : `FROM: ${msg.senderName}`}
                                 </span>
                               </div>
                               <span className="text-[9px] font-mono text-slate-600">{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-400 italic leading-relaxed">"{msg.text}"</p>
                            <div className="flex justify-between items-center">
                              <div className="text-[8px] text-slate-700 uppercase font-bold tracking-widest">
                                {msg.recipientId === 'PRIMARY_ADMIN' ? 'ROUTED: HQ CONTROL' : `TARGET: ID_${msg.recipientId.slice(-4)}`}
                              </div>
                              {msg.senderId !== admin.phone && (
                                <button 
                                  onClick={() => {
                                    setMsgRecipientId(msg.senderId);
                                    setMsgText(`REPLYING TO: "${msg.text.substring(0, 20)}..." - `);
                                  }}
                                  className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-500 hover:text-white transition-colors"
                                >
                                  <Reply size={10} /> Reply
                                </button>
                              )}
                            </div>
                         </div>
                       ))
                     )}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-6 sticky top-8">
              <h3 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">HQ Comms Control</h3>
              
              <div className="space-y-4">
                <p className="text-[10px] text-slate-500 uppercase leading-relaxed italic">
                  {isPrimary ? 'Broadcast to entire medical/admin staff or select specific targets.' : 'Report anomalies to Primary HQ or selected Medical Staff.'}
                </p>
                
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-slate-600">Administrative Targets</label>
                  
                  {isPrimary ? (
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                       {/* Multiple select UI for Primary */}
                       <button 
                         onClick={() => {
                           const allIds = [...doctors.map(d => d.phone), ...secondaryAdmins.map(a => a.phone)];
                           setMsgRecipientId(prev => (Array.isArray(prev) && prev.length === allIds.length) ? [] : allIds);
                         }}
                         className="w-full text-left p-2 rounded bg-brand-black border border-brand-border text-[9px] uppercase font-bold text-slate-500 hover:text-white"
                       >
                         {Array.isArray(msgRecipientId) && msgRecipientId.length === (doctors.length + secondaryAdmins.length) ? 'Deselect All' : 'Select All Personnel'}
                       </button>
                       {secondaryAdmins.map(a => (
                         <button 
                           key={a.phone}
                           onClick={() => toggleRecipient(a.phone)}
                           className={`w-full flex items-center justify-between p-3 rounded bg-brand-black border transition-all ${Array.isArray(msgRecipientId) && msgRecipientId.includes(a.phone) ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-brand-border'}`}
                         >
                            <span className="text-[9px] font-bold text-white uppercase">Admin: {a.name}</span>
                            {Array.isArray(msgRecipientId) && msgRecipientId.includes(a.phone) && <CheckCircle2 size={12} className="text-emerald-500" />}
                         </button>
                       ))}
                       {doctors.map(d => (
                         <button 
                           key={d.phone}
                           onClick={() => toggleRecipient(d.phone)}
                           className={`w-full flex items-center justify-between p-3 rounded bg-brand-black border transition-all ${Array.isArray(msgRecipientId) && msgRecipientId.includes(d.phone) ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-brand-border'}`}
                         >
                            <span className="text-[9px] font-bold text-white uppercase">MD: {d.name}</span>
                            {Array.isArray(msgRecipientId) && msgRecipientId.includes(d.phone) && <CheckCircle2 size={12} className="text-emerald-500" />}
                         </button>
                       ))}
                    </div>
                  ) : (
                    <select 
                      value={typeof msgRecipientId === 'string' ? msgRecipientId : ''}
                      onChange={(e) => setMsgRecipientId(e.target.value)}
                      className="w-full bg-brand-black border border-brand-border p-3 rounded text-[10px] text-white uppercase font-bold tracking-widest outline-none focus:border-emerald-500"
                    >
                      <option value="">AWAITING SELECTION...</option>
                      <option value="PRIMARY_ADMIN">PRIMARY COMMAND (HQ)</option>
                      {doctors.map(d => <option key={d.phone} value={d.phone}>DR. {d.name.toUpperCase()}</option>)}
                    </select>
                  )}
                </div>

                <textarea 
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="ENTER SECURE TRANSMISSION..."
                  className="w-full bg-brand-black border border-brand-border rounded-xl p-4 text-[10px] text-white uppercase focus:border-emerald-500 outline-none min-h-[100px] resize-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!msgRecipientId || (Array.isArray(msgRecipientId) && msgRecipientId.length === 0)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-black py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
                >
                  <Send size={12} /> Broadcast Transmission
                </button>
              </div>

              {isPrimary && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 mt-4">
                   <div className="flex items-center gap-2 text-emerald-500">
                     <Shield size={14} />
                     <span className="text-[10px] uppercase font-bold tracking-widest">Root Authority Active</span>
                   </div>
                   <p className="text-[9px] text-slate-500 uppercase leading-relaxed italic">You have broadcast privileges. Messages sent to 'PRIMARY_ADMIN' will also appear in your inbound stream.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedDoctorId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="max-w-2xl w-full bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-black/50">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">Clinical Performance Log</h3>
                    <p className="text-xs text-emerald-500 mt-1 uppercase tracking-widest font-bold">DR. {users.find(u => u.phone === selectedDoctorId)?.name}</p>
                  </div>
                  <button onClick={() => setSelectedDoctorId(null)} className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest border border-brand-border px-3 py-1 rounded">Close</button>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {consultations.filter(c => c.doctorId === selectedDoctorId && c.status === 'REVIEWED').length === 0 ? (
                      <div className="text-center py-12 text-slate-600 italic uppercase text-[10px] tracking-widest">No verified transmissions logged for this operative.</div>
                    ) : (
                      <div className="bg-brand-black rounded-2xl overflow-hidden border border-brand-border">
                        <table className="w-full text-left">
                          <thead className="bg-brand-hover/50 text-[9px] uppercase tracking-widest text-slate-500 font-bold border-b border-brand-border">
                            <tr>
                              <th className="p-4">Patient Name</th>
                              <th className="p-4">Consultation Date</th>
                              <th className="p-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border">
                            {consultations
                              .filter(c => c.doctorId === selectedDoctorId && c.status === 'REVIEWED')
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                              .map(c => (
                                <tr key={c.id} className="text-[11px] text-slate-400 hover:bg-brand-hover/20 transition-colors">
                                  <td className="p-4 font-bold text-white uppercase tracking-tight">{c.patientName}</td>
                                  <td className="p-4 font-mono">{new Date(c.timestamp).toLocaleString()}</td>
                                  <td className="p-4 text-right">
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold uppercase">Verified</span>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 bg-brand-black/50 border-t border-brand-border flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <BarChart3 size={14} className="text-emerald-500" />
                     <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Aggregate Throughput</span>
                   </div>
                   <div className="text-right">
                     <span className="text-2xl font-mono text-emerald-500 font-bold">{getConsultCount(selectedDoctorId)}</span>
                     <span className="text-[9px] text-slate-700 ml-2 uppercase font-bold tracking-widest">Patients Processed</span>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}

        {(showAddDoc || showAddAdmin) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="max-w-md w-full bg-brand-card border border-brand-border rounded-3xl p-8 relative">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6">Register New {showAddDoc ? 'Medical Officer' : 'Staff Admin'}</h3>
                <form onSubmit={showAddDoc ? handleRegisterDoc : handleRegisterSecAdmin} className="space-y-4">
                  <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="FULL LEGAL NAME" className="w-full bg-brand-black border border-brand-border p-4 rounded-xl text-xs text-white uppercase focus:border-emerald-500 outline-none" />
                  <input required value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="IDENTIFIER_CODE" className="w-full bg-brand-black border border-brand-border p-4 rounded-xl text-xs text-white uppercase focus:border-emerald-500 outline-none" />
                  <input required maxLength={5} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="5-DIGIT PIN" className="w-full bg-brand-black border border-brand-border p-4 rounded-xl text-xs text-white uppercase focus:border-emerald-500 outline-none tracking-widest" />
                  <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all">Authorize Registration</button>
                  <button type="button" onClick={resetForm} className="w-full py-2 text-[9px] uppercase tracking-widest font-bold text-slate-500 hover:text-white">Abort Process</button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-6 flex items-center gap-4 transition-all hover:border-emerald-500/30">
      <div className={`w-10 h-10 rounded-lg bg-brand-black border border-brand-border flex items-center justify-center ${color} shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
        <p className={`text-2xl font-mono font-bold leading-none ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`px-6 py-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${active ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
    >
      {label}
    </button>
  );
}
