/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Navbar() {
  return (
    <nav className="border-b border-brand-border bg-brand-black px-8 py-6 sticky top-0 z-50 flex items-center justify-between" id="main-nav">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
        </div>
        <h1 className="text-xl tracking-widest font-serif italic text-white uppercase">
          Derm.Vision 
          <span className="text-[10px] font-sans not-italic font-light text-slate-500 tracking-normal ml-3">Powered by Gemini AI</span>
        </h1>
      </div>
      <div className="hidden sm:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">
        <span className="hover:text-white cursor-pointer transition-colors">Patient Records</span>
        <span className="hover:text-white cursor-pointer transition-colors">Lab Sync</span>
        <div className="w-8 h-8 rounded-full border border-brand-border bg-slate-800"></div>
      </div>
    </nav>
  );
}
