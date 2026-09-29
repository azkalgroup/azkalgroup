"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      const userId = await getUserId();
      if (userId) {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('investor_id', userId)
          .order('created_at', { ascending: false });
        if (data) setTransactions(data);
      }
      setLoading(false);
    }
    loadTransactions();
  }, []);

  const tabs = ['Semua', 'Setor Dana', 'Tarik Dana', 'Pendanaan', 'Bagi Hasil'];

  const filteredTransactions = activeTab === 'Semua' 
    ? transactions 
    : transactions.filter(t => t.type === activeTab);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Pantau seluruh aktivitas keuangan, investasi, dan pembagian hasil Anda.</p>
        </div>
        
        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Unduh Laporan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* TABS */}
        <div className="flex overflow-x-auto border-b border-slate-200 px-6 pt-2 hide-scrollbar gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TABLE LIST */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-medium text-slate-500">ID Ref / Tanggal</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Keterangan</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500 text-right">Jumlah</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{trx.id.substring(0,8).toUpperCase()}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{new Date(trx.created_at).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 capitalize">{trx.type}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Sistem InvestTrack</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-bold ${trx.type === 'withdraw' || trx.type === 'investasi' ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {trx.type === 'withdraw' || trx.type === 'investasi' ? '-' : '+'}Rp {trx.amount?.toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                          trx.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                          trx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            trx.status === 'success' ? 'bg-emerald-500' :
                            trx.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {trx.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Tidak ada transaksi untuk kategori ini.
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
