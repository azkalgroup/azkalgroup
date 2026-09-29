"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [totalAsset, setTotalAsset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      const userId = await getUserId();
      if (userId) {
        const { data } = await supabase
          .from('investments')
          .select('*, projects(*)')
          .eq('investor_id', userId);
          
        if (data) {
          setInvestments(data);
          const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          setTotalAsset(total);
        }
      }
      setLoading(false);
    }
    loadPortfolio();
  }, []);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portofolio Anda</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Pantau kinerja dan status aset investasi yang Anda miliki.</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Nilai Aset</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "..." : `Rp ${totalAsset.toLocaleString('id-ID')}`}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Keuntungan (Unrealized)</p>
            <p className="text-2xl font-bold text-emerald-600">Rp 0</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Proyek</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "..." : investments.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
        </div>
      </div>

      {/* PORTFOLIO GRID */}
      <h3 className="text-lg font-bold text-slate-900 mb-6">Aset Aktif Anda</h3>
      {loading ? (
        <p className="text-slate-500 text-center py-10">Memuat portofolio...</p>
      ) : investments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {investments.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              {/* Image & Badges */}
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <img src={item.projects?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={item.projects?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-emerald-100 text-emerald-700`}>
                    Berjalan
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium backdrop-blur-md shadow-sm bg-white/90 text-slate-800`}>
                    {item.projects?.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-slate-500 font-medium mb-2">Diinvestasikan sejak {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                <h3 className="text-lg font-bold text-slate-900 mb-6 leading-tight">{item.projects?.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Modal Disetor</p>
                    <p className="font-bold text-slate-700">Rp {item.amount?.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Nilai Saat Ini</p>
                    <p className="font-bold text-emerald-600">Rp {item.amount?.toLocaleString('id-ID')} <span className="text-xs ml-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md">0%</span></p>
                  </div>
                </div>

                {/* Action */}
                <a href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20meminta%20laporan%20terbaru%20untuk%20investasi%20saya%20di%20*${encodeURIComponent(item.projects?.name)}*.`} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 flex justify-center bg-slate-900 text-white font-bold text-sm rounded-xl text-center hover:bg-emerald-500 transition-all shadow-sm active:scale-[0.98]">
                  Minta Laporan Terbaru
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500 font-medium mb-4">Anda belum memiliki investasi.</p>
          <a href="/opportunities" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-emerald-700">Mulai Investasi</a>
        </div>
      )}
    </div>
  );
}
