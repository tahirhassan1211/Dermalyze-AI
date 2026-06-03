/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, FileText, ChevronRight, Download, Trash2 } from 'lucide-react';
import { PatientRecord } from '../types';
import { jsPDF } from 'jspdf';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: PatientRecord[];
}

export default function RecordsModal({ isOpen, onClose, records }: Props) {
  const exportPDF = (record: PatientRecord, includeReview = false) => {
    const doc = new jsPDF();
    const userJson = localStorage.getItem('derm_vision_session');
    const user = userJson ? JSON.parse(userJson) : null;
    
    const renderTextWithPagination = (textLines: string[], startY: number, fontSize = 10, color = 0) => {
      let y = startY;
      const margin = 20;
      const docHeight = doc.internal.pageSize.getHeight();
      
      doc.setFontSize(fontSize);
      doc.setTextColor(color);

      textLines.forEach((line) => {
        if (y > docHeight - 25) {
          doc.addPage();
          y = 20;
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text("CONTINUATION REPORT - CLINICAL DATA", margin, 12);
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
    doc.text(`Recorded on: ${new Date(record.timestamp).toLocaleString()}`, 20, 30);
    
    if (user) {
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text("PATIENT INFORMATION:", 20, 45);
      doc.setFontSize(11);
      doc.text(`Name: ${user.name}`, 20, 52);
      doc.text(`Mobile: ${user.phone}`, 20, 59);
    }

    doc.line(20, 65, 190, 65);
    doc.setFontSize(14);
    doc.text("AI DIAGNOSTIC FINDINGS:", 20, 75);
    
    const splitText = doc.splitTextToSize(record.analysis.replace(/[#*]/g, ''), 170);
    let currentY = renderTextWithPagination(splitText, 82, 10, 0);
    
    if (includeReview && record.doctorResponse) {
      currentY += 15;
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setDrawColor(16, 185, 129);
      doc.line(20, currentY - 5, 190, currentY - 5);
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("PROFESSIONAL MEDICAL REVIEW:", 20, currentY);
      
      currentY += 10;
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.text("Doctor Feedback:", 20, currentY);
      const fLines = doc.splitTextToSize(record.doctorResponse.feedback, 170);
      currentY = renderTextWithPagination(fLines, currentY + 7, 10, 60);

      if (record.doctorResponse.precautions) {
        currentY += 10;
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Precautions:", 20, currentY);
        const pLines = doc.splitTextToSize(record.doctorResponse.precautions, 170);
        currentY = renderTextWithPagination(pLines, currentY + 7, 10, 60);
      }

      if (record.doctorResponse.medicines) {
        currentY += 10;
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Suggested Medications:", 20, currentY);
        const mLines = doc.splitTextToSize(record.doctorResponse.medicines, 170);
        currentY = renderTextWithPagination(mLines, currentY + 7, 10, 60);
      }
    }

    // Add footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} | DermVision Security Protocol`, 20, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`DermVision_Record_${record.id}.pdf`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-black">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Patient History</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">Found {records.length} stored scan(s)</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {records.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-600 gap-2 border-2 border-dashed border-brand-border rounded-2xl">
                  <FileText size={32} opacity={0.2} />
                  <p className="text-xs uppercase tracking-widest font-bold">No Records Found</p>
                </div>
              ) : (
                records.map((record) => (
                  <div 
                    key={record.id}
                    className="p-4 bg-brand-hover border border-brand-border rounded-2xl group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-black border border-brand-border flex items-center justify-center text-emerald-500">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ID: {record.id.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => exportPDF(record)}
                          className="p-2 text-slate-500 hover:text-emerald-500 bg-brand-black rounded border border-brand-border transition-colors focus:ring-1 focus:ring-emerald-500"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-brand-black/50 p-3 rounded-lg border border-brand-border/50">
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic">
                        {record.analysis.substring(0, 150)}...
                      </p>
                    </div>

                    {record.doctorResponse && (
                      <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">Clinical Feedback</p>
                          <span className="text-[8px] text-slate-500 font-mono italic">Validated by MD</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {record.doctorResponse.feedback}
                        </p>
                        {(record.doctorResponse.precautions || record.doctorResponse.medicines) && (
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/10">
                            {record.doctorResponse.precautions && (
                              <div className="space-y-1">
                                <p className="text-[8px] uppercase font-bold text-slate-500">Precautions</p>
                                <p className="text-[10px] text-slate-400 leading-tight">{record.doctorResponse.precautions}</p>
                              </div>
                            )}
                            {record.doctorResponse.medicines && (
                              <div className="space-y-1">
                                <p className="text-[8px] uppercase font-bold text-slate-500">Suggested</p>
                                <p className="text-[10px] text-white leading-tight font-bold">{record.doctorResponse.medicines}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <button 
                          onClick={() => exportPDF(record, true)}
                          className="text-[9px] uppercase tracking-[0.2em] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors border border-emerald-500/20 px-3 py-1.5 rounded bg-emerald-500/5 mt-2"
                        >
                          <Download size={12} /> Download Clinical Feedback
                        </button>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                       <div className="flex items-center gap-1">
                         {record.doctorResponse ? (
                           <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase tracking-wider">
                             Reviewed
                           </div>
                         ) : (
                           <div className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[8px] font-bold uppercase tracking-wider">
                             Pending Review
                           </div>
                         )}
                       </div>
                       <button className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                         View Details <ChevronRight size={12} strokeWidth={3} />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-brand-black border-t border-brand-border">
              <p className="text-[9px] text-center text-slate-600 uppercase tracking-widest font-bold">
                Local clinical storage active · End-to-end encrypted
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
