"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [chartFilter, setChartFilter] = useState("Tahun Ini");
  
  // Real Data State
  const [totalAsset, setTotalAsset] = useState(0);
  const [totalInvestor, setTotalInvestor] = useState(0);
  const [pendingTrxCount, setPendingTrxCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom UI States
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadAdminData() {
      // Jalankan SEMUA query secara paralel agar tidak menunggu satu per satu
      const [
        { count: investorCount },
        { count: pendingCount },
        { data: projectsData },
        { data: trxData },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'investor'),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('projects').select('id,name,target_amount,collected_amount,status,created_at').order('created_at', { ascending: false }),
        supabase.from('transactions').select('id,type,amount,status,created_at,user_id,profiles(full_name)').order('created_at', { ascending: false }).limit(3),
      ]);

      setTotalInvestor(investorCount || 0);
      setPendingTrxCount(pendingCount || 0);

      if (projectsData) {
        setActiveProjects(projectsData.slice(0, 3));
        const total = projectsData.reduce((acc, curr) => acc + (curr.collected_amount || 0), 0);
        setTotalAsset(total);
      }

      if (trxData) setRecentTransactions(trxData);

      setLoading(false);
    }
    loadAdminData();

  }, []);

  const handleBackup = async () => {
    setShowConfirmModal(false);
    setIsBackingUp(true);
    showToast("Proses backup dimulai...", "success");
    try {
      const res = await fetch('/api/backup-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast("Backup berhasil! Data terbaru sudah ada di Google Sheets.", "success");
      } else {
        showToast("Backup gagal: " + data.error, "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat membackup data.", "error");
    }
    setIsBackingUp(false);
  };

  const getChartData = () => {
    switch (chartFilter) {
      case "Bulan Ini":
        return [
          { label: 'Minggu 1', value: 30, color: 'bg-emerald-200' },
          { label: 'Minggu 2', value: 45, color: 'bg-emerald-300' },
          { label: 'Minggu 3', value: 35, color: 'bg-emerald-200' },
          { label: 'Minggu 4', value: 90, color: 'bg-emerald-500 shadow-lg shadow-emerald-500/20' },
        ];
      case "Semua Waktu":
        return [
          { label: '2023', value: 50, color: 'bg-emerald-300' },
          { label: '2024', value: 65, color: 'bg-emerald-400' },
          { label: '2025', value: 80, color: 'bg-emerald-400' },
          { label: '2026', value: 95, color: 'bg-emerald-500 shadow-lg shadow-emerald-500/20' },
        ];
      case "Tahun Ini":
      default:
        return [
          { label: 'Jan', value: 40, color: 'bg-emerald-200' },
          { label: 'Feb', value: 55, color: 'bg-emerald-300' },
          { label: 'Mar', value: 45, color: 'bg-emerald-200' },
          { label: 'Apr', value: 70, color: 'bg-emerald-400' },
          { label: 'Mei', value: 65, color: 'bg-emerald-300' },
          { label: 'Jun', value: 85, color: 'bg-emerald-500 shadow-lg shadow-emerald-500/20' },
          { label: 'Jul', value: 75, color: 'bg-emerald-400' },
        ];
    }
  };

  const currentChartData = getChartData();

  return (
    <div className="flex-1 w-full p-6 md:p-8 pt-8 min-h-screen relative">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-[slideDown_0.3s_ease-out]">
          <style>{`
            @keyframes slideDown {
              from { transform: translate(-50%, -100%); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
          <div className={`px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border flex items-center gap-3 backdrop-blur-md ${
            toast.type === 'error' 
              ? 'bg-red-50/95 border-red-200 text-red-800' 
              : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            )}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-[slideUp_0.2s_ease-out]">
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Backup Full Database</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Apakah Anda yakin ingin membackup seluruh database (User, Proyek, Transaksi) ke Google Sheets? Proses ini akan menimpa data lama di Sheets Anda.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors whitespace-nowrap"
                >
                  Batal
                </button>
                <button 
                  onClick={handleBackup}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  Ya, Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor Admin</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Ringkasan performa platform InvestTrack.</p>
        </div>
        
        <button 
          onClick={() => setShowConfirmModal(true)}
          disabled={isBackingUp}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isBackingUp ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          )}
          {isBackingUp ? 'Membackup...' : 'Backup Full DB'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Aset Platform</p>
          <h3 className="text-2xl font-bold text-slate-900">{loading ? "..." : `Rp ${totalAsset.toLocaleString('id-ID')}`}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Investor Aktif</p>
          <h3 className="text-2xl font-bold text-slate-900">{loading ? "..." : `${totalInvestor} User`}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Transaksi Menunggu Persetujuan</p>
          <h3 className="text-2xl font-bold text-amber-500">{loading ? "..." : `${pendingTrxCount} Antrean`}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Pertumbuhan (Mock) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Pertumbuhan Aset</h3>
            <select 
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Tahun Ini">Tahun Ini</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Semua Waktu">Semua Waktu</option>
            </select>
          </div>
          
          <div className="flex-1 relative w-full min-h-[250px] flex items-end gap-2 pt-10">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
              {[...Array(5)].map((_, i) => {
                const val = Math.abs(i - 4) * 500000;
                const label = val === 0 ? '0' : val >= 1000000
                  ? `${(val / 1000000).toFixed(1).replace('.0','')}jt`
                  : `${(val / 1000).toFixed(0)}rb`;
                return (
                  <div key={i} className="w-full h-[1px] bg-slate-100 flex items-center">
                    <span className="absolute -left-1 text-[10px] text-slate-400 -translate-x-full bg-white pr-2">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Mock Bars */}
            {currentChartData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative">
                <div className={`w-full max-w-[40px] rounded-t-md ${bar.color} transition-all duration-300 hover:opacity-80`} style={{ height: `${bar.value}%` }}></div>
                <span className="text-xs text-slate-500 mt-3">{bar.label}</span>
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Rp {(bar.value * 5000).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proyek Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Proyek Aktif</h3>
            <Link href="/admin/opportunities" className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Lihat Semua</Link>
          </div>

          <div className="space-y-5 flex-1">
            {loading ? (
              <p className="text-sm text-slate-500">Memuat...</p>
            ) : activeProjects.length > 0 ? (
              activeProjects.map((project, i) => (
                <div key={project.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Target: Rp {project.target_amount.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Tersedia</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`bg-emerald-500 h-2 rounded-full transition-all duration-1000`} style={{ width: `0%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Belum ada proyek.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Transaksi Terbaru Menunggu Persetujuan</h3>
          <Link href="/admin/transactions" className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Kelola Transaksi</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Jumlah</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Memuat data transaksi...</td>
                </tr>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{trx.profiles?.full_name || 'Tanpa Nama'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trx.type === 'withdraw' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {trx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">Rp {trx.amount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(trx.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-3 py-1 rounded-md">Terima</button>
                      <button className="text-rose-600 hover:text-rose-900 bg-rose-50 px-3 py-1 rounded-md">Tolak</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada transaksi sama sekali.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
