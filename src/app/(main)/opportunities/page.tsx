"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function OpportunitiesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase.from('projects').select('*').eq('status', 'Aktif').order('created_at', { ascending: false });
      if (data) setOpportunities(data);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const categories = ['Semua', 'Kesehatan', 'F&B', 'Manufaktur', 'Teknologi', 'Properti'];

  const filteredOpportunities = activeCategory === 'Semua' 
    ? opportunities 
    : opportunities.filter(item => item.category === activeCategory);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Peluang Investasi</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Temukan dan danai proyek-proyek potensial dengan return terbaik.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto relative">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            {activeCategory === 'Semua' ? 'Filter Kategori' : activeCategory}
          </button>
          
          {/* Dropdown Menu */}
          {filterOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-20">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500 font-medium">Memuat peluang investasi...</p>
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOpportunities.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              {/* Image */}
              <div className="h-56 relative overflow-hidden bg-slate-100">
                <img src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium backdrop-blur-md shadow-sm bg-white/90 text-slate-800`}>
                    {item.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-6">Target Dana: <span className="font-bold text-slate-700">Rp {item.target_amount?.toLocaleString('id-ID')}</span></p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <p className="text-sm text-slate-500 font-medium mb-1">Proyeksi ROI</p>
                    <p className="font-bold text-emerald-600">{item.roi}</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <p className="text-sm text-slate-500 font-medium mb-1">Tenggat</p>
                    <p className="font-bold text-slate-700">{new Date(item.deadline).toLocaleDateString('id-ID', {month:'short', year:'numeric'})}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-8 mt-auto">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Terkumpul</span>
                    <span className="text-emerald-600">{item.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full relative" style={{ width: `${item.progress || 0}%` }}>
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-2">Rp {item.collected_amount?.toLocaleString('id-ID') || '0'} dari Rp {item.target_amount?.toLocaleString('id-ID')}</p>
                </div>

                {/* Action */}
                <a href={`https://wa.me/6281234567890?text=Halo%20Admin%20InvestTrack,%20saya%20tertarik%20untuk%20berinvestasi%20di%20proyek%20*${encodeURIComponent(item.name)}*.%20Mohon%20info%20lebih%20lanjut.`} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 flex justify-center bg-slate-900 text-white font-bold text-sm rounded-xl text-center hover:bg-emerald-500 transition-all shadow-sm active:scale-[0.98]">
                  Investasi Sekarang
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500 font-medium">Belum ada proyek untuk kategori ini.</p>
        </div>
      )}
    </div>
  );
}
