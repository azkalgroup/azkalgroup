"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen]);

  const menuItems = [
    { title: "Dasbor Utama", type: "Halaman", href: "/" },
    { title: "Katalog Peluang Investasi", type: "Halaman", href: "/opportunities" },
    { title: "Aksi: Setor Dana", type: "Aksi WhatsApp", href: "https://wa.me/6281234567890?text=Halo%20Admin%20InvestTrack,%20saya%20ingin%20melakukan%20Setor%20Dana." },
    { title: "Aksi: Tarik Dana", type: "Aksi WhatsApp", href: "https://wa.me/6281234567890?text=Halo%20Admin%20InvestTrack,%20saya%20ingin%20melakukan%20Tarik%20Dana." },
    { title: "Proyek: Pembangunan Villa Mewah Bali", type: "Proyek", href: "https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20tertarik%20investasi%20di%20Villa%20Mewah%20Bali" },
    { title: "Proyek: Pembangkit Listrik Surya", type: "Proyek", href: "https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20tertarik%20investasi%20di%20Pembangkit%20Listrik" }
  ];

  const filtered = query === "" ? menuItems : menuItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative w-full max-w-xl cursor-text group"
      >
        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <div className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-400 group-hover:border-emerald-400 transition-all shadow-sm flex items-center justify-between gap-2">
          <span className="truncate min-w-0">Cari aset, proyek, atau jalan pintas...</span>
          <div className="flex gap-1 flex-shrink-0">
             <kbd className="hidden md:inline-flex bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500">⌘</kbd>
             <kbd className="hidden md:inline-flex bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500">K</kbd>
          </div>
        </div>
      </div>

      {/* MODAL COMMAND PALETTE */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 sm:px-0">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
          
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-slate-100">
               <svg className="w-6 h-6 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                 type="text" 
                 autoFocus
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Ketik 'Setor' atau 'Villa'..." 
                 className="flex-1 bg-transparent text-slate-900 text-lg placeholder-slate-400 focus:outline-none"
               />
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg p-1.5 transition-colors text-[10px] font-bold px-2 tracking-wider">ESC</button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-900 font-bold mb-1">Tidak ditemukan</p>
                  <p className="text-slate-500 text-sm">Coba kata kunci lain seperti "Setor", "Proyek", atau "Dasbor".</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filtered.map((item, i) => {
                    const isExternal = item.href.startsWith('http');
                    
                    const icon = item.type === 'Aksi WhatsApp' 
                      ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      : item.type === 'Proyek' 
                      ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

                    const iconColor = item.type === 'Aksi WhatsApp' 
                      ? 'bg-amber-100 text-amber-600' 
                      : item.type === 'Proyek' 
                      ? 'bg-cyan-100 text-cyan-600'
                      : 'bg-slate-100 text-slate-600';

                    const Content = () => (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${iconColor}`}>
                             {icon}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.title}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.type}</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </>
                    );

                    return isExternal ? (
                      <a 
                        key={i} 
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3 hover:bg-emerald-50 rounded-xl group transition-colors"
                      >
                        <Content />
                      </a>
                    ) : (
                      <Link 
                        key={i} 
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3 hover:bg-emerald-50 rounded-xl group transition-colors"
                      >
                        <Content />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex justify-between items-center">
              <span>Navigasi Cepat InvestTrack</span>
              <span className="flex items-center gap-1.5">
                Pilih dengan <kbd className="bg-white border border-slate-200 rounded px-1.5 shadow-sm text-slate-700">Enter</kbd> atau klik
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
