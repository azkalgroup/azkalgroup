"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';
import SkeletonCard from '@/components/SkeletonCard';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Ambil user session dulu (cepat, dari cache lokal)
      // Use cached user ID for fast local lookup
      const userId = await getUserId();
      if (!userId) { setLoading(false); return; }

      // Removed user check; using cached userId

      // Jalankan profile + projects PARALEL sekaligus
      const [profileResult, projectsResult] = await Promise.all([
        supabase.from('profiles').select('id,full_name,balance,avatar_url').eq('id', userId).single(),
        supabase.from('projects').select('id,name,title,category,target_amount,collected_amount,status,roi,image_url,created_at').order('created_at', { ascending: false }).limit(3),
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (projectsResult.data) setProjects(projectsResult.data);

      setLoading(false);
    }
    loadData();
  }, []);


  return (
    <div className="flex-1 w-full p-6 md:p-8 pt-8 md:pt-8 min-h-screen pb-24 md:pb-12">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {loading ? "Memuat..." : `Halo, ${profile?.full_name || 'Investor'}!`}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Selamat datang kembali di Dasbor Anda.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => alert('Fitur filter tanggal akan aktif setelah integrasi database data nyata.')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex-1 md:flex-auto justify-center shadow-sm">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            12 Okt - 18 Okt, 2023
            <svg className="w-4 h-4 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => alert('Fitur filter lanjutan akan aktif setelah integrasi database data nyata.')} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 - Total Investment */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between h-[190px]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium mb-1">Saldo Tersedia</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? <SkeletonCard height="h-8" /> : `Rp ${profile?.balance?.toLocaleString('id-ID') || '0'}`}
            </h3>
          </div>
          <div className="flex items-end gap-1.5 mt-4 h-10">
            {[35, 45, 40, 60, 55, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-200/60 rounded-t-[3px]" style={{ height: `${h}%` }}></div>
            ))}
            <div className="flex-1 bg-emerald-500 rounded-t-[3px]" style={{ height: '100%' }}></div>
          </div>
        </div>

        {/* Card 2 - Active Portfolios */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between h-[190px]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +8.2%
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium mb-1">Portofolio Aktif</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">0</h3>
          </div>
          <div className="flex items-end gap-1.5 mt-4 h-10">
            {[25, 35, 50, 40, 35].map((h, i) => (
              <div key={i} className="flex-1 bg-amber-200/60 rounded-t-[3px]" style={{ height: `${h}%` }}></div>
            ))}
            <div className="flex-1 bg-[#b79b63] rounded-t-[3px]" style={{ height: '70%' }}></div>
            <div className="flex-1 bg-amber-200/60 rounded-t-[3px]" style={{ height: '30%' }}></div>
          </div>
        </div>

        {/* Card 3 - Total ROI */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between h-[190px]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +3.1%
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium mb-1">Total ROI</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">0%</h3>
          </div>
          <div className="flex items-end gap-1.5 mt-4 h-10">
            {[40, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-cyan-200/60 rounded-t-[3px]" style={{ height: `${h}%` }}></div>
            ))}
            <div className="flex-1 bg-cyan-600/80 rounded-t-[3px]" style={{ height: '45%' }}></div>
            {[60, 55, 30, 25].map((h, i) => (
              <div key={i} className="flex-1 bg-cyan-200/60 rounded-t-[3px]" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        {/* Card 4 - Pending Distributions */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between h-[190px]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              -0.4%
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium mb-1">Distribusi Tertunda</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Rp 0</h3>
          </div>
          <div className="flex items-end gap-1.5 mt-4 h-10">
            {[60, 50, 60].map((h, i) => (
              <div key={i} className="flex-1 bg-red-200/60 rounded-t-[3px]" style={{ height: `${h}%` }}></div>
            ))}
            <div className="flex-1 bg-red-500/80 rounded-t-[3px]" style={{ height: '35%' }}></div>
            {[50, 40, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-red-200/60 rounded-t-[3px]" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

      </div>

      {/* PERTUMBUHAN PORTOFOLIO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pertumbuhan Portofolio</h3>
            <p className="text-sm text-slate-500 mt-0.5">Riwayat saldo dan transaksi Anda</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-slate-700 font-bold text-base">Belum ada data pertumbuhan</p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">Grafik pertumbuhan akan muncul setelah Anda melakukan setor dana dan berinvestasi di proyek.</p>
          <a href="/deposit" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            Setor Dana Sekarang
          </a>
        </div>
      </div>

      {/* ALOKASI ASET + DISTRIBUSI SEKTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Alokasi Aset */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Alokasi Aset</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-slate-700 font-bold text-sm">Belum ada alokasi</p>
            <p className="text-slate-400 text-xs mt-1 max-w-[220px]">Alokasi aset per kategori akan muncul setelah Anda berinvestasi di proyek.</p>
          </div>
        </div>

        {/* Distribusi Sektor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Sektor</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-slate-700 font-bold text-sm">Belum ada distribusi</p>
            <p className="text-slate-400 text-xs mt-1 max-w-[220px]">Distribusi sektor akan muncul setelah Anda berinvestasi di beberapa proyek berbeda.</p>
          </div>
        </div>
      </div>

      {/* TABLE — Proyek Aktif */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-10 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Proyek Pendanaan Terbaru</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Peluang investasi terbaik saat ini</p>
          </div>
          <Link href="/opportunities" className="text-emerald-600 text-xs font-bold hover:underline">Lihat Semua Proyek</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-sm font-medium text-slate-500 whitespace-nowrap">Nama Proyek</th>
                <th className="pb-3 text-sm font-medium text-slate-500 whitespace-nowrap">Kategori</th>
                <th className="pb-3 text-sm font-medium text-slate-500 whitespace-nowrap">Target Dana</th>
                <th className="pb-3 text-sm font-medium text-slate-500 whitespace-nowrap">Status</th>
                <th className="pb-3 text-sm font-medium text-slate-500 whitespace-nowrap text-right pr-2">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="py-3">
                      <SkeletonCard height="h-6" />
                    </td>
                  </tr>
                ))
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 whitespace-nowrap pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {project.image_url ? (
                            <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-sm text-slate-800">{project.name}</p>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{project.category}</span>
                    </td>
                    <td className="py-4 font-bold text-sm text-slate-700 whitespace-nowrap pr-6">
                      Rp {project.target_amount?.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 whitespace-nowrap pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">{project.status}</span>
                    </td>
                    <td className="py-4 text-sm font-bold text-emerald-600 whitespace-nowrap text-right pr-2">
                      {project.roi}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <p className="text-slate-500 text-sm font-medium">Belum ada proyek tersedia.</p>
                    <a href="/opportunities" className="inline-block mt-2 text-emerald-600 text-xs font-bold hover:underline">Lihat Peluang Investasi →</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
