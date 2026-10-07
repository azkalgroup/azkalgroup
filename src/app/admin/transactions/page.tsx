"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminTransactionsPage() {
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (data) setTransactions(data);
    setLoading(false);
  };

  const handleApprove = async (trx: any) => {
    const { error } = await supabase.from('transactions').update({ status: 'success' }).eq('id', trx.id);
    if (!error) {
      setTransactions(prev => prev.map(t => t.id === trx.id ? { ...t, status: "success" } : t));
      // Kirim Notifikasi ke User
      await supabase.from('notifications').insert({
        user_id: trx.user_id,
        title: `Transaksi Disetujui`,
        message: `Permintaan ${trx.type === 'deposit' ? 'Setor' : 'Tarik'} Dana sebesar Rp ${trx.amount?.toLocaleString('id-ID')} telah disetujui.`,
      });
    } else {
      alert("Gagal menyetujui: " + error.message);
    }
  };

  const handleReject = async (trx: any) => {
    const { error } = await supabase.from('transactions').update({ status: 'rejected' }).eq('id', trx.id);
    if (!error) {
      setTransactions(prev => prev.map(t => t.id === trx.id ? { ...t, status: "rejected" } : t));
      // Kirim Notifikasi ke User
      await supabase.from('notifications').insert({
        user_id: trx.user_id,
        title: `Transaksi Ditolak`,
        message: `Maaf, permintaan ${trx.type === 'deposit' ? 'Setor' : 'Tarik'} Dana sebesar Rp ${trx.amount?.toLocaleString('id-ID')} Anda ditolak.`,
      });
    } else {
      alert("Gagal menolak: " + error.message);
    }
  };

  const filteredTransactions = transactions.filter(trx => {
    const trxStatus = trx.status || '';
    const matchFilter = filter === "Semua" || trxStatus.toLowerCase() === filter.toLowerCase();
    const matchSearch = (trx.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
                        trx.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex-1 w-full p-6 md:p-8 pt-8 min-h-screen animate-fade-in relative">
      
      {/* MODAL LIHAT DETAIL */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-[slideUp_0.2s_ease-out]">
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Detail Transaksi</h3>
                <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ID Transaksi</p>
                  <p className="text-sm font-mono text-slate-900 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">{selectedTransaction.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold border capitalize ${
                        selectedTransaction.type === 'withdraw' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        selectedTransaction.type === 'deposit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {selectedTransaction.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold capitalize ${
                        selectedTransaction.status === 'success' ? 'text-emerald-700 bg-emerald-100' : 
                        selectedTransaction.status === 'pending' ? 'text-amber-700 bg-amber-100 animate-pulse' : 
                        'text-rose-700 bg-rose-100'
                      }`}>
                        {selectedTransaction.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User</p>
                  <p className="text-sm font-bold text-slate-900">{selectedTransaction.profiles?.full_name || 'Tanpa Nama'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jumlah</p>
                  <p className="text-lg font-black text-slate-900">Rp {selectedTransaction.amount?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal & Waktu</p>
                  <p className="text-sm font-medium text-slate-700">{new Date(selectedTransaction.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
               <button onClick={() => setSelectedTransaction(null)} className="w-full py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm">
                 Tutup
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Persetujuan Transaksi</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Kelola arus kas deposit, penarikan, dan investasi pengguna.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export Laporan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar: Search and Tabs */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["Semua", "Pending", "Success", "Rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === tab 
                    ? tab === "Pending" ? "bg-amber-100 text-amber-800" :
                      tab === "Success" ? "bg-emerald-100 text-emerald-800" :
                      tab === "Rejected" ? "bg-rose-100 text-rose-800" :
                      "bg-slate-800 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab}
                {tab === "Pending" && transactions.filter(t => t.status === 'pending').length > 0 && (
                  <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${filter === "Pending" ? "bg-amber-200 text-amber-900" : "bg-amber-100 text-amber-800"}`}>
                    {transactions.filter(t => t.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari ID atau Nama..."
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel Transaksi */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / User</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah & Metode</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-slate-500 mb-0.5" title={trx.id}>{trx.id.substring(0,8).toUpperCase()}</div>
                      <div className="text-sm font-bold text-slate-900">{trx.profiles?.full_name || 'Tanpa Nama'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize ${
                        trx.type === 'withdraw' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        trx.type === 'deposit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {trx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">Rp {trx.amount?.toLocaleString('id-ID')}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Sistem
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(trx.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        trx.status === 'success' ? 'text-emerald-700 bg-emerald-100' : 
                        trx.status === 'pending' ? 'text-amber-700 bg-amber-100 animate-pulse' : 
                        'text-rose-700 bg-rose-100'
                      }`}>
                        {trx.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {trx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApprove(trx)} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                            Terima
                          </button>
                          <button onClick={() => handleReject(trx)} className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedTransaction(trx)} className="text-slate-400 hover:text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition-all">
                          Lihat Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="text-lg font-medium text-slate-600">Tidak ada transaksi ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Menampilkan <span className="text-slate-900 font-bold">{paginatedTransactions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> dari <span className="text-slate-900 font-bold">{filteredTransactions.length}</span> transaksi</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all">Sebelumnya</button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
