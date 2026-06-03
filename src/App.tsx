/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Mic, 
  FileText, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  Info,
  LogOut,
  User as UserIcon,
  Database,
  ShieldCheck,
  Bell
} from 'lucide-react';
import Navbar from './components/Navbar';
import Disclaimer from './components/Disclaimer';
import ImageInput from './components/ImageInput';
import VoiceInput from './components/VoiceInput';
import TextInput from './components/TextInput';
import AnalysisResult from './components/AnalysisResult';
import Login from './components/Login';
import RecordsModal from './components/RecordsModal';
import RoleSelection from './components/RoleSelection';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { analyzeSkinCondition } from './services/geminiService';
import { UserProfile, PatientRecord, AnalysisInput, InputMode, UserRole, ConsultationRequest, UserMessage } from './types';

const PRIMARY_ADMIN: UserProfile = {
  name: 'ADMIN_01',
  phone: 'HQ_ADMIN_8888',
  pin: '11111',
  role: UserRole.ADMIN,
  isAdminPrimary: true
};

export default function App() {
  const [activeModes, setActiveModes] = useState<Set<InputMode>>(new Set([InputMode.IMAGE]));
  const [inputData, setInputData] = useState<AnalysisInput>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allRecords, setAllRecords] = useState<PatientRecord[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [lastNotifiedMsgId, setLastNotifiedMsgId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string, sender: string } | null>(null);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);

  // Load all data from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('derm_vision_records');
    if (savedRecords) setAllRecords(JSON.parse(savedRecords));
    
    const savedConsultations = localStorage.getItem('derm_vision_consultations');
    if (savedConsultations) setConsultations(JSON.parse(savedConsultations));

    const savedUsers = localStorage.getItem('derm_vision_users');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      // Ensure primary admin is always there
      if (!parsed.find((u: UserProfile) => u.phone === PRIMARY_ADMIN.phone)) {
        parsed.push(PRIMARY_ADMIN);
      }
      setAllUsers(parsed);
    } else {
      setAllUsers([PRIMARY_ADMIN]);
    }

    const savedMessages = localStorage.getItem('derm_vision_messages');
    if (savedMessages) {
      const msgs = JSON.parse(savedMessages);
      setMessages(msgs);
      // Initialize lastNotified to the most recent ID so we only notify on REALLY new ones
      if (msgs.length > 0) setLastNotifiedMsgId(msgs[0].id);
    }

    const savedSession = localStorage.getItem('derm_vision_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setUser(parsed);
      setSelectedRole(parsed.role);
    }
  }, []);

  // Filter records for the current user
  const userRecords = allRecords.filter(r => r.userId === user?.phone);

  const saveRecord = (analysis: string) => {
    if (!user) return;
    const newRecord: PatientRecord = {
      id: Math.random().toString(36).substring(7),
      userId: user.phone,
      timestamp: new Date().toISOString(),
      analysis: analysis,
    };
    const updatedRecords = [newRecord, ...allRecords];
    setAllRecords(updatedRecords);
    localStorage.setItem('derm_vision_records', JSON.stringify(updatedRecords));
  };

  const handleRequestConsultation = (doctorId: string) => {
    if (!user || !result) return;
    const request: ConsultationRequest = {
      id: Math.random().toString(36).substring(7),
      patientId: user.phone,
      patientName: user.name,
      doctorId: doctorId,
      timestamp: new Date().toISOString(),
      analysis: result,
      inputs: JSON.parse(JSON.stringify(inputData)), // Deep copy to ensure data persists correctly
      status: 'PENDING'
    };
    const updated = [request, ...consultations];
    setConsultations(updated);
    localStorage.setItem('derm_vision_consultations', JSON.stringify(updated));
    alert(`Case successfully routed to Dr. ${allUsers.find(u => u.phone === doctorId)?.name}. Triage active.`);
  };

  const doctorConsultations = consultations.filter(c => c.doctorId === user?.phone);

  const handleReviewConsultation = (id: string, responseData: ConsultationRequest['doctorResponse']) => {
    const updated = consultations.map(c => 
      c.id === id ? { ...c, status: 'REVIEWED' as const, doctorResponse: responseData } : c
    );
    setConsultations(updated);
    localStorage.setItem('derm_vision_consultations', JSON.stringify(updated));

    // Also update patient record if matches
    const consultation = consultations.find(c => c.id === id);
    if (consultation) {
      const updatedRecords = allRecords.map(r => 
        (r.userId === consultation.patientId && r.analysis === consultation.analysis)
          ? { ...r, doctorResponse: responseData }
          : r
      );
      setAllRecords(updatedRecords);
      localStorage.setItem('derm_vision_records', JSON.stringify(updatedRecords));
    }
  };

  const handleRegisterDoctor = (doctor: UserProfile) => {
    const updated = [...allUsers, doctor];
    setAllUsers(updated);
    localStorage.setItem('derm_vision_users', JSON.stringify(updated));
  };

  const handleRemoveDoctor = (phone: string) => {
    const updated = allUsers.filter(u => u.phone !== phone);
    setAllUsers(updated);
    localStorage.setItem('derm_vision_users', JSON.stringify(updated));
  };

  const handleRegisterAdmin = (admin: UserProfile) => {
    const updated = [...allUsers, admin];
    setAllUsers(updated);
    localStorage.setItem('derm_vision_users', JSON.stringify(updated));
  };

  const handleSendMessage = (text: string, recipientId: string | string[]) => {
    if (!user) return;
    const recipientIds = Array.isArray(recipientId) ? recipientId : [recipientId];
    
    const newMsgs: UserMessage[] = recipientIds.map(rid => ({
      id: Math.random().toString(36).substring(7),
      senderId: user.phone,
      senderName: user.name,
      recipientId: rid,
      timestamp: new Date().toISOString(),
      text
    }));

    const updated = [...newMsgs, ...messages];
    setMessages(updated);
    setLastNotifiedMsgId(newMsgs[0].id); // Don't notify the sender
    localStorage.setItem('derm_vision_messages', JSON.stringify(updated));
    alert("Message(s) transmitted successfully.");
  };

  // Notification Polling & Sync
  useEffect(() => {
    if (!user) return;
    
    // Use a ref-like approach via a closure variable if needed, but standard state should work
    // However, to ensure we don't miss anything due to state batching, we read the latest ID directly
    const checkMessages = () => {
      const saved = localStorage.getItem('derm_vision_messages');
      if (!saved) return;
      
      const msgs: UserMessage[] = JSON.parse(saved);
      if (msgs.length === 0) return;

      const latestIdInStorage = msgs[0].id;
      
      // We use a local variable to keep track of what we just notified in this exact poll
      setLastNotifiedMsgId(currentId => {
        if (latestIdInStorage === currentId) return currentId;

        // Collect new messages since currentId
        const newMsgs: UserMessage[] = [];
        for (const m of msgs) {
          if (m.id === currentId) break;
          newMsgs.push(m);
        }

        if (newMsgs.length > 0) {
          // Check for recipient match
          const forMe = newMsgs.some(m => 
            (m.recipientId === user.phone || (m.recipientId === 'PRIMARY_ADMIN' && user.isAdminPrimary)) &&
            m.senderId !== user.phone
          );

          if (forMe) {
            const latestForMe = newMsgs.find(m => 
              (m.recipientId === user.phone || (m.recipientId === 'PRIMARY_ADMIN' && user.isAdminPrimary)) &&
              m.senderId !== user.phone
            );
            if (latestForMe) {
              setNotification({ text: latestForMe.text, sender: latestForMe.senderName });
              setTimeout(() => setNotification(null), 6000);
            }
          }
          
          setMessages(msgs);
          return latestIdInStorage;
        }
        
        return currentId || latestIdInStorage;
      });
    };

    // Run immediately
    checkMessages();

    // Poll frequently for other tabs/background changes
    const interval = setInterval(checkMessages, 2000);
    
    // Storage event for instant feedback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'derm_vision_messages') {
        checkMessages();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);

  const renderNotification = () => (
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-sm bg-brand-card border border-emerald-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Bell size={20} className="animate-bounce" />
          </div>
          <div className="flex-grow overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Incoming Signal from {notification.sender}</p>
            <p className="text-xs text-white truncate">{notification.text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('derm_vision_session', JSON.stringify(userData));
    // If it was primary admin, ensure it's in allUsers
    if (userData.isAdminPrimary && !allUsers.find(u => u.phone === userData.phone)) {
       const updated = [...allUsers, userData];
       setAllUsers(updated);
       localStorage.setItem('derm_vision_users', JSON.stringify(updated));
    }
  };

  const handleSignup = (userData: UserProfile) => {
    const updatedUsers = [...allUsers, userData];
    setAllUsers(updatedUsers);
    setUser(userData);
    localStorage.setItem('derm_vision_users', JSON.stringify(updatedUsers));
    localStorage.setItem('derm_vision_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem('derm_vision_session');
    reset();
  };

  const toggleMode = (mode: InputMode) => {
    setActiveModes(prev => {
      const next = new Set(prev);
      if (next.has(mode)) {
        if (next.size > 1) next.delete(mode);
      } else {
        next.add(mode);
      }
      return next;
    });
  };

  const handleAnalysis = async () => {
    if (!inputData.image && !inputData.voice && !inputData.text) {
      alert("Please provide at least one form of input (Image, Voice, or Text).");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analyzeSkinCondition(inputData);
      setResult(response);
      saveRecord(response);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze inputs. Please ensure you have configured your Gemini API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setInputData({});
    setActiveModes(new Set([InputMode.IMAGE]));
  };

  if (!selectedRole && !user) {
    return <RoleSelection onSelectRole={setSelectedRole} />;
  }

  if (!user && selectedRole) {
    return (
      <Login 
        role={selectedRole}
        onLogin={handleLogin} 
        onSignup={handleSignup} 
        users={allUsers} 
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  // Doctor View
  if (user?.role === UserRole.DOCTOR) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-black">
        {renderNotification()}
        <header className="border-b border-brand-border bg-brand-card px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
               <Database size={20} />
            </div>
            <h1 className="text-xl font-serif italic text-white tracking-widest uppercase">Derm.Vision MD</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Sign Out</span>
            <LogOut size={16} />
          </button>
        </header>
        <DoctorDashboard 
          doctor={user} 
          consultations={doctorConsultations} 
          onReview={handleReviewConsultation} 
          messages={messages.filter(m => m.recipientId === user.phone || m.senderId === user.phone)}
          admins={allUsers.filter(u => u.role === UserRole.ADMIN)}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  // Admin View
  if (user?.role === UserRole.ADMIN) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-black">
        {renderNotification()}
        <header className="border-b border-brand-border bg-brand-card px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
               <ShieldCheck size={20} />
            </div>
            <h1 className="text-xl font-serif italic text-white tracking-widest uppercase">Admin.Vision Control</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Terminate Session</span>
            <LogOut size={16} />
          </button>
        </header>
        <AdminDashboard 
          admin={user}
          users={allUsers}
          consultations={consultations}
          messages={messages}
          onRegisterDoctor={handleRegisterDoctor}
          onRemoveDoctor={handleRemoveDoctor}
          onRegisterAdmin={handleRegisterAdmin}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black font-sans text-[#d1d1d6] selection:bg-emerald-500/30 selection:text-white flex flex-col">
      <Navbar />
      
      {renderNotification()}
      
      {/* User Header */}
      <div className="max-w-6xl mx-auto w-full px-8 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4 bg-brand-hover border border-brand-border px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <UserIcon size={16} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold leading-none mb-1">Active Patient</p>
            <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setIsRecordsOpen(true)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer group"
          >
            <Database size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">{userRecords.length} Records</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer group"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Sign Out</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <Disclaimer />

            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Diagnostic Input</h2>
                <p className="text-xs text-slate-500">Enable sensors for analysis.</p>
              </div>

              <div className="flex flex-col gap-3">
                <ModeButton 
                  active={activeModes.has(InputMode.IMAGE)} 
                  onClick={() => toggleMode(InputMode.IMAGE)}
                  icon={<Camera size={20} strokeWidth={1.5} />}
                  label="Image Upload"
                />
                <ModeButton 
                  active={activeModes.has(InputMode.VOICE)} 
                  onClick={() => toggleMode(InputMode.VOICE)}
                  icon={<Mic size={20} strokeWidth={1.5} />}
                  label="Voice Note"
                />
                <ModeButton 
                  active={activeModes.has(InputMode.TEXT)} 
                  onClick={() => toggleMode(InputMode.TEXT)}
                  icon={<FileText size={20} strokeWidth={1.5} />}
                  label="Text Symptoms"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || (!inputData.image && !inputData.voice && !inputData.text)}
                  className="w-full py-4 rounded-lg bg-emerald-500 disabled:bg-brand-card disabled:border disabled:border-brand-border disabled:text-slate-600 text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.1)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Run AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  key="input-stage"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 bg-brand-card p-4 rounded-xl border border-brand-border">
                    <div className="inline-block h-10 w-10 rounded border border-brand-border bg-slate-800 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&h=100&fit=crop')] bg-cover"></div>
                    <div>
                      <h3 className="text-xs font-semibold text-white">Clinical Scan Instance: A-992</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Awaiting multi-modal input processing</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${isAnalyzing ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {isAnalyzing ? 'Active Link' : 'Secure Ready'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    {activeModes.has(InputMode.IMAGE) && (
                      <InputCard title="Dermatological Scan" subtitle="Upload or capture a focus-locked macrolens perspective">
                        <ImageInput 
                          onImageCaptured={(data, mimeType) => setInputData(prev => ({ ...prev, image: { data, mimeType } }))}
                          onClear={() => setInputData(prev => ({ ...prev, image: undefined }))}
                        />
                      </InputCard>
                    )}

                    {activeModes.has(InputMode.VOICE) && (
                      <InputCard title="Vocal Diagnostics" subtitle="Describe duration, intensity, and secondary symptoms">
                        <VoiceInput 
                          onAudioCaptured={(data, mimeType) => setInputData(prev => ({ ...prev, voice: { data, mimeType } }))}
                          onClear={() => setInputData(prev => ({ ...prev, voice: undefined }))}
                        />
                      </InputCard>
                    )}

                    {activeModes.has(InputMode.TEXT) && (
                      <InputCard title="Case Documentation" subtitle="Formalize symptoms and history for model enrichment">
                        <TextInput 
                          value={inputData.text || ''}
                          onChange={(val) => setInputData(prev => ({ ...prev, text: val }))}
                          onClear={() => setInputData(prev => ({ ...prev, text: undefined }))}
                        />
                      </InputCard>
                    )}
                  </div>
                </motion.div>
              ) : (
                <AnalysisResult 
                  markdown={result} 
                  onReset={reset} 
                  onConsult={handleRequestConsultation}
                  availableDoctors={allUsers.filter(u => u.role === UserRole.DOCTOR)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="px-8 py-6 border-t border-brand-border bg-brand-black flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600 gap-4 mt-auto">
        <div className="flex gap-6 tracking-widest uppercase font-bold">
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> SYSTEM OPTIMAL</span>
          <span>ENCRYPTION: AES-256</span>
          <span>HIPAA COMPLIANT</span>
        </div>
        <div className="uppercase tracking-tighter">&copy; 2026 DERM.VISION ANALYTICS GROUP</div>
      </footer>

      <RecordsModal 
        isOpen={isRecordsOpen} 
        onClose={() => setIsRecordsOpen(false)} 
        records={userRecords} 
      />
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-xl transition-all border cursor-pointer flex-1 min-w-full lg:min-w-0
        ${active 
          ? 'bg-brand-hover border-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-brand-card border-brand-border text-slate-500 hover:border-slate-600 hover:text-slate-300'}
      `}
    >
      <div className={`p-2 rounded transition-colors ${active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-hover text-slate-500'}`}>
        {icon}
      </div>
      <div className="text-left">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[10px] uppercase tracking-widest opacity-60">Ready</div>
      </div>
      {active && (
        <div className="ml-auto w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
        </div>
      )}
    </button>
  );
}

function InputCard({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-card p-8 rounded-2xl border border-brand-border"
    >
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

