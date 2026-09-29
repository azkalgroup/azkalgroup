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

  useEffect(() => {
    async function loadAdminData() {
      // 1. Total Investor
      const { count: investorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'investor');
      setTotalInvestor(investorCount || 0);

      // 2. Transaksi Menunggu
      const { count: pendingCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      setPendingTrxCount(pendingCount || 0);

      // 3. Proyek Aktif & Total Aset
      const { data: projectsData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projectsData) {
        setActiveProjects(projectsData.slice(0, 3));
        const total = projectsData.reduce((acc, curr) => acc + (curr.target_amount || 0), 0);
        setTotalAsset(total);
      }

      // 4. Transaksi Terbaru
      const { data: trxData } = await supabase
        .from('transactions')
        .select(`*, profiles(full_name)`)
        .order('created_at', { ascending: false })
        .limit(3);
      if (trxData) setRecentTransactions(trxData);

      setLoading(false);
    }
    loadAdminData();
  }, []);

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
    <div className="flex-1 w-full p-6 md:p-8 pt-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dasbor Admin</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Ringkasan performa platform InvestTrack.</p>
        </div>
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-slate-100 flex items-center">
                  <span className="absolute -left-1 text-[10px] text-slate-400 -translate-x-full bg-white pr-2">
                    {Math.abs(i - 4) * 1.5}M
                  </span>
                </div>
              ))}
            </div>
            
            {/* Mock Bars */}
            {currentChartData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative">
                <div className={`w-full max-w-[40px] rounded-t-md ${bar.color} transition-all duration-300 hover:opacity-80`} style={{ height: `${bar.value}%` }}></div>
                <span className="text-xs text-slate-500 mt-3">{bar.label}</span>
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Rp {(bar.value / 10).toFixed(1)}M
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
                      <p className="text-sm font-bold text-slate-900">{project.title}</p>
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
