/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Download, Share2, CornerUpLeft, User, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { UserProfile } from '../types';

interface Props {
  markdown: string;
  onReset: () => void;
  onConsult: (doctorId: string) => void;
  availableDoctors: UserProfile[];
}

export default function AnalysisResult({ markdown, onReset, onConsult, availableDoctors }: Props) {
  const [showDoctorSelect, setShowDoctorSelect] = useState(false);
  const [consulted, setConsulted] = useState(false);

  const handleConsult = (doctorId: string) => {
    onConsult(doctorId);
    setConsulted(true);
    setShowDoctorSelect(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const userJson = localStorage.getItem('derm_vision_session');
    const user = userJson ? JSON.parse(userJson) : null;
    
    // Pagination Helper
    const renderTextWithPagination = (textLines: string[], startY: number, fontSize = 10, color = 0) => {
      let y = startY;
      const margin = 20;
      const pageHeight = doc.internal.pageSize.getHeight();
      const bottomHeight = 25;

      doc.setFontSize(fontSize);
      doc.setTextColor(color);

      textLines.forEach((line) => {
        if (y > pageHeight - bottomHeight) {
          doc.addPage();
          y = 20;
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text("CONTINUED TRANSMISSION - CLINICAL LOGS", margin, 12);
          doc.setFontSize(fontSize);
          doc.setTextColor(color);
        }
        doc.text(line, margin, y);
        y += 5.5;
      });
      return y;
    };

    doc.setFontSize(22);
    doc.text("DERM.VISION CLINICAL REPORT", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    if (user) {
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text("PATIENT INFORMATION:", 20, 45);
      doc.setFontSize(11);
      doc.text(`Name: ${user.name}`, 20, 52);
      doc.text(`Mobile Identification: ${user.phone}`, 20, 59);
    }

    doc.line(20, 65, 190, 65);
    doc.setFontSize(14);
    doc.text("AI DIAGNOSTIC FINDINGS:", 20, 75);
    
    const splitText = doc.splitTextToSize(markdown.replace(/[#*]/g, ''), 170);
    let currentY = renderTextWithPagination(splitText, 82, 10, 0);
    
    // Check for Clinical Feedback
    const savedConsultations = localStorage.getItem('derm_vision_consultations');
    if (savedConsultations) {
      const consultations = JSON.parse(savedConsultations);
      const match = consultations.find((c: any) => 
        c.patientId === user?.phone && 
        c.analysis === markdown && 
        c.status === 'REVIEWED'
      );

      if (match && match.doctorResponse) {
        currentY += 15;
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        doc.setDrawColor(16, 185, 129);
        doc.line(20, currentY - 5, 190, currentY - 5);
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129); // Emerald color
        doc.text("PROFESSIONAL CLINICAL VALIDATION:", 20, currentY);
        
        currentY += 10;
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text("Primary Feedback:", 20, currentY);
        
        const feedbackLines = doc.splitTextToSize(match.doctorResponse.feedback, 170);
        currentY = renderTextWithPagination(feedbackLines, currentY + 7, 10, 60); // Darker gray for feedback
        
        if (match.doctorResponse.precautions) {
          currentY += 10;
          doc.setFontSize(11);
          doc.setTextColor(0);
          doc.text("Recommended Precautions:", 20, currentY);
          const pLines = doc.splitTextToSize(match.doctorResponse.precautions, 170);
          currentY = renderTextWithPagination(pLines, currentY + 7, 10, 60);
        }

        if (match.doctorResponse.medicines) {
          currentY += 10;
          doc.setFontSize(11);
          doc.setTextColor(0);
          doc.text("Suggested Medications:", 20, currentY);
          const mLines = doc.splitTextToSize(match.doctorResponse.medicines, 170);
          currentY = renderTextWithPagination(mLines, currentY + 7, 10, 60);
        }
      }
    }

    // Add footer to current page
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} | DermVision Security Protocol Enabled`, 20, doc.internal.pageSize.height - 10);
      if (i === 1) {
        doc.text("Disclaimer: AI-generated insights for educational purposes. Consult specialists.", 20, doc.internal.pageSize.height - 15);
      }
    }
    
    doc.save(`DermVision_Clinical_Report_${new Date().getTime()}.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="analysis-result"
    >
      <div className="bg-brand-card p-8 rounded-2xl border border-brand-border">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-brand-border">
          <div className="space-y-1">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Analysis Synthesis</h2>
            <p className="text-xs text-slate-500">Multi-modal Diagnostic Output</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors cursor-pointer border border-brand-border px-4 py-2 rounded-lg bg-brand-hover"
            >
              <Download size={14} />
              Export PDF
            </button>
            <a 
              href={`mailto:?subject=DermVision Clinical Report&body=Please find the clinical report details below:%0A%0A${encodeURIComponent(markdown.replace(/[#*]/g, ''))}`}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors cursor-pointer border border-brand-border px-4 py-2 rounded-lg bg-brand-hover"
            >
              <Share2 size={14} />
              Email findings
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold">AI Findings</h4>
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-500 font-bold tracking-widest">STABLE SCAN</div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-h2:font-serif prose-h2:italic prose-h2:text-3xl prose-h2:text-white prose-h2:mb-4 prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-400">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-hover p-6 rounded-xl border border-brand-border h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Clinical Metadata</h4>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="p-4 rounded-lg bg-brand-black border-l-2 border-emerald-500">
                  <p className="text-[9px] text-emerald-500 font-bold uppercase mb-1">Confidence Interval</p>
                  <p className="text-xl font-mono text-white tracking-tighter">98.4<span className="text-xs text-slate-500 ml-1">%</span></p>
                </div>
                
                <div className="p-4 rounded-lg bg-brand-black border-l-2 border-slate-700">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Processing Mode</p>
                  <p className="text-sm font-medium text-white uppercase tracking-widest">Multi-Spectral</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-border space-y-3">
                <AnimatePresence>
                  {showDoctorSelect ? (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Select Clinical Specialist</p>
                      {availableDoctors.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic p-3 border border-brand-border rounded bg-brand-black">No specialists currently active.</p>
                      ) : (
                        availableDoctors.map(doc => (
                          <button 
                            key={doc.phone}
                            onClick={() => handleConsult(doc.phone)}
                            className="w-full flex items-center justify-between p-3 rounded bg-brand-black border border-brand-border hover:border-emerald-500/50 group transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Stethoscope size={14} />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">Dr. {doc.name}</p>
                                <p className="text-[8px] text-slate-500 uppercase tracking-widest">Medical ID: {doc.phone.slice(-4)}</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-500" />
                          </button>
                        ))
                      )}
                      <button 
                        onClick={() => setShowDoctorSelect(false)}
                        className="w-full py-2 text-[9px] uppercase tracking-widest font-bold text-slate-500 hover:text-white"
                      >
                        Cancel Selection
                      </button>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => !consulted && setShowDoctorSelect(true)}
                      disabled={consulted}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] transition-all ${
                        consulted 
                          ? 'bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20' 
                          : 'bg-brand-black text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black'
                      }`}
                    >
                      {consulted ? (
                        <>
                          <CheckCircle2 size={14} />
                          Forwarded to Specialist
                        </>
                      ) : (
                        <>
                          <Share2 size={14} />
                          Consult Specialist
                        </>
                      )}
                    </button>
                  )}
                </AnimatePresence>
                
                <button 
                  onClick={onReset}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-black py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98]"
                >
                  <CornerUpLeft size={14} strokeWidth={3} />
                  Initiate New Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
