"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [totalAsset, setTotalAsset] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [earningsByProject, setEarningsByProject] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Earnings history modal
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      const userId = await getUserId();
      if (userId) {
        // Load investments + earnings in parallel
        const [{ data: investData }, { data: earningsData }] = await Promise.all([
          supabase
            .from('investments')
            .select('id,amount,created_at,projects(id,name,category,status,roi,image_url)')
            .eq('user_id', userId),
          supabase
            .from('investor_earnings')
            .select('project_id,earning_amount')
            .eq('investor_id', userId),
        ]);
          
        if (investData) {
          setInvestments(investData);
          const total = investData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          setTotalAsset(total);
        }

        if (earningsData) {
          const totalEarn = earningsData.reduce((acc, curr) => acc + (curr.earning_amount || 0), 0);
          setTotalEarnings(totalEarn);

          // Group by project
          const byProject: Record<string, number> = {};
          earningsData.forEach((e) => {
            byProject[e.project_id] = (byProject[e.project_id] || 0) + (e.earning_amount || 0);
          });
          setEarningsByProject(byProject);
        }
      }
      setLoading(false);
    }
    loadPortfolio();
  }, []);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const openEarningsHistory = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setLoadingHistory(true);
    const userId = await getUserId();
    const { data } = await supabase
      .from('investor_earnings')
      .select('id,earning_amount,ownership_percentage,created_at,rental_revenues(customer_name,rental_date,duration_days,net_revenue)')
      .eq('investor_id', userId!)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setEarningsHistory(data || []);
    setLoadingHistory(false);
  };

  const roiPercentage = totalAsset > 0 ? ((totalEarnings / totalAsset) * 100).toFixed(1) : '0';

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
            <p className="text-2xl font-bold text-slate-900">{loading ? "..." : formatRupiah(totalAsset + totalEarnings)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Modal + Keuntungan</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Keuntungan</p>
            <p className="text-2xl font-bold text-emerald-600">{loading ? "..." : `+${formatRupiah(totalEarnings)}`}</p>
            {!loading && (
              <p className="text-xs text-emerald-500 mt-0.5 font-medium">
                ROI: {roiPercentage}%
              </p>
            )}
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
          {investments.map((item) => {
            const projectEarnings = earningsByProject[item.projects?.id] || 0;
            const currentValue = (item.amount || 0) + projectEarnings;
            const returnPct = item.amount > 0 ? ((projectEarnings / item.amount) * 100).toFixed(1) : '0';
            
            return (
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
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 mt-auto">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Modal Disetor</p>
                      <p className="font-bold text-slate-700">{formatRupiah(item.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Nilai Saat Ini</p>
                      <p className="font-bold text-emerald-600">
                        {formatRupiah(currentValue)}
                        {projectEarnings > 0 && (
                          <span className="text-xs ml-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md">+{returnPct}%</span>
                        )}
                        {projectEarnings === 0 && (
                          <span className="text-xs ml-1 bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md">0%</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Earnings Summary */}
                  {projectEarnings > 0 && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Keuntungan</p>
                          <p className="text-sm font-bold text-emerald-700">+{formatRupiah(projectEarnings)}</p>
                        </div>
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEarningsHistory(item.projects?.id)}
                      className="flex-1 py-3 flex justify-center bg-slate-900 text-white font-bold text-sm rounded-xl text-center hover:bg-emerald-500 transition-all shadow-sm active:scale-[0.98]"
                    >
                      Riwayat Keuntungan
                    </button>
                    <a 
                      href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20meminta%20laporan%20terbaru%20untuk%20investasi%20saya%20di%20*${encodeURIComponent(item.projects?.name)}*.`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="py-3 px-4 flex items-center justify-center bg-white text-slate-600 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
                      title="Hubungi Admin"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500 font-medium mb-4">Anda belum memiliki investasi.</p>
          <a href="/opportunities" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-emerald-700">Mulai Investasi</a>
        </div>
      )}

      {/* MODAL: Riwayat Keuntungan */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-900">Riwayat Keuntungan</h3>
              <button
                onClick={() => { setSelectedProjectId(null); setEarningsHistory([]); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loadingHistory ? (
                <div className="p-8 text-center text-slate-500 text-sm">Memuat riwayat...</div>
              ) : earningsHistory.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {earningsHistory.map((e) => (
                    <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Sewa oleh {e.rental_revenues?.customer_name || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {e.rental_revenues?.rental_date 
                              ? new Date(e.rental_revenues.rental_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                              : new Date(e.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                            }
                            {' · '}
                            {e.rental_revenues?.duration_days || 0} hari
                            {' · '}
                            Bagian {e.ownership_percentage}%
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-emerald-600 flex-shrink-0">
                        +{formatRupiah(e.earning_amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-500 text-sm">Belum ada riwayat keuntungan untuk proyek ini.</p>
                </div>
              )}
            </div>

            {/* Total */}
            {earningsHistory.length > 0 && (
              <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
                <p className="text-sm font-bold text-emerald-700">Total Keuntungan</p>
                <p className="text-lg font-bold text-emerald-700">
                  +{formatRupiah(earningsHistory.reduce((acc, e) => acc + (e.earning_amount || 0), 0))}
                </p>
              </div>
            )}

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => { setSelectedProjectId(null); setEarningsHistory([]); }}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
