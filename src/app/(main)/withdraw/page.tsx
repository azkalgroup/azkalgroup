"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth';

const banks = [
  { id: 'BCA', name: 'BCA', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg', color: '#0066AE' },
  { id: 'Mandiri', name: 'mandiri', logo: '', color: '#003d79' },
  { id: 'BNI', name: 'BNI 46', logo: '', color: '#005e6a' },
  { id: 'BRI', name: 'BRI', logo: '', color: '#00529c' },
];

const ewallets = [
  { id: 'GoPay', name: 'gopay', logo: '', color: '#00a5cf' },
  { id: 'OVO', name: 'OVO', logo: '', color: '#4c2a86' },
  { id: 'DANA', name: 'DANA', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg', color: '#118EEA' },
  { id: 'ShopeePay', name: 'ShopeePay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', color: '#EE4D2D' },
];

const presetAmounts = [50000, 100000, 250000, 350000, 500000, 1000000];

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BCA');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  // Custom Toast State
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const router = useRouter();

  const isEwallet = ewallets.some(w => w.id === method);

  useEffect(() => {
    async function fetchBalance() {
      const userId = await getUserId();
      if (!userId) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
        
      if (data) {
        setAvailableBalance(data.balance || 0);
      }
      setLoadingBalance(false);
    }
    fetchBalance();
  }, []);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountName || !accountNumber) return;
    
    setIsSubmitting(true);
    const userId = await getUserId();
    if (!userId) {
      showToast("Sesi Anda telah berakhir, silakan login kembali.", "error");
      setIsSubmitting(false);
      return;
    }

    const numAmount = Number(amount.replace(/\D/g, ''));
    
    // 1. Account Number Validation (Form Field Validation)
    if (isEwallet) {
      if (!accountNumber.startsWith('08') && !accountNumber.startsWith('628')) {
        showToast("Nomor handphone harus diawali dengan 08 atau 628", "error");
        setIsSubmitting(false);
        return;
      }
      if (accountNumber.length < 10 || accountNumber.length > 15) {
        showToast("Nomor handphone tidak valid (minimal 10 digit)", "error");
        setIsSubmitting(false);
        return;
      }
    } else {
      if (accountNumber.length < 10 || accountNumber.length > 16) {
        showToast("Nomor rekening tidak valid (biasanya 10-16 angka)", "error");
        setIsSubmitting(false);
        return;
      }
    }

    // 2. Amount and Balance Validation (Business Logic Validation)
    if (numAmount < 100000) {
      showToast("Minimal penarikan adalah Rp 100.000", "error");
      setIsSubmitting(false);
      return;
    }

    if (numAmount > availableBalance) {
      showToast("Saldo Anda tidak mencukupi untuk penarikan ini.", "error");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('transactions').insert([{
      user_id: userId,
      type: 'withdraw',
      amount: numAmount,
      status: 'pending'
    }]);

    if (!error) {
      // 1. Notifikasi untuk Investor
      await supabase.from('notifications').insert([{
        user_id: userId,
        title: '⏳ Permintaan Tarik Dana',
        message: `Permintaan tarik dana Anda sebesar Rp ${numAmount.toLocaleString('id-ID')} sedang diproses oleh admin.`,
      }]);

      // 2. Notifikasi untuk Admin
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminNotifs = admins.map((admin) => ({
          user_id: admin.id,
          title: '🔔 Penarikan Dana Baru',
          message: `Ada permintaan penarikan dana baru sebesar Rp ${numAmount.toLocaleString('id-ID')}. Segera proses di dashboard.`,
        }));
        await supabase.from('notifications').insert(adminNotifs);
      }
    }

    setIsSubmitting(false);

    if (error) {
      showToast("Gagal membuat permintaan penarikan: " + error.message, "error");
    } else {
      showToast("Permintaan berhasil! Dana akan ditransfer setelah disetujui.", "success");
      setTimeout(() => {
        router.push('/transactions');
      }, 1500);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleNumpadInput = (val: string) => {
    setAmount(prev => {
      const current = prev + val;
      if (current.length > 12) return prev;
      return current;
    });
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    
    if (isEwallet) {
      if (val.length > 0) {
        if (val[0] !== '0' && val[0] !== '6') return;
        if (val.length > 1 && val.startsWith('0') && val[1] !== '8') return;
        if (val.length > 1 && val.startsWith('6') && val[1] !== '2') return;
        if (val.length > 2 && val.startsWith('62') && val[2] !== '8') return;
      }
    }
    
    setAccountNumber(val);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-3xl mx-auto pb-24 md:pb-8 relative">
      
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tarik Dana</h1>
        <p className="text-slate-500 font-medium mt-2">Tarik saldo keuntungan atau modal investasi Anda ke rekening bank atau E-Wallet.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-slate-700">Jumlah Penarikan (Rp)</label>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">Saldo Tersedia</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {loadingBalance ? '...' : `Rp ${availableBalance.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">Rp</span>
                </div>
                
                {/* Desktop Input */}
                <input 
                  type="text" 
                  value={amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : ''}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="hidden md:block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                />
                
                {/* Mobile Input Trigger */}
                <div 
                  onClick={() => setShowNumpad(true)}
                  className="md:hidden w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg cursor-text"
                >
                  {amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : <span className="text-slate-400">0</span>}
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-800 hover:text-slate-900 hover:bg-slate-50 transition-colors active:scale-95"
                  >
                    Rp {new Intl.NumberFormat('id-ID').format(preset)}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-slate-500 font-medium">Minimal penarikan Rp 100.000</p>
                <p 
                  className="text-xs text-slate-900 font-bold cursor-pointer hover:underline"
                  onClick={() => setAmount(availableBalance.toString())}
                >
                  Tarik Semua Saldo
                </p>
              </div>
            </div>

            {/* Target Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">Pilih Tujuan Penarikan</label>
              
              <div className="space-y-6">
                {/* Transfer Bank */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Transfer Bank</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {banks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setMethod(bank.id);
                          setAccountNumber(''); // Reset on method change
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          method === bank.id 
                            ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="h-8 flex items-center justify-center w-full bg-white rounded p-1">
                          {bank.logo ? (
                            <img src={bank.logo} alt={bank.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          ) : (
                            <span className="font-black text-xl italic tracking-tighter" style={{ color: bank.color }}>{bank.name}</span>
                          )}
                        </div>
                        <span className={`text-xs font-bold ${method === bank.id ? 'text-emerald-700' : 'text-slate-600'}`}>{bank.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* E-Wallet */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">E-Wallet</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ewallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => {
                          setMethod(wallet.id);
                          setAccountNumber(''); // Reset on method change
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          method === wallet.id 
                            ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="h-8 flex items-center justify-center w-full bg-white rounded p-1">
                          {wallet.logo ? (
                            <img src={wallet.logo} alt={wallet.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          ) : (
                            <span className="font-black text-xl italic tracking-tighter" style={{ color: wallet.color }}>{wallet.name}</span>
                          )}
                        </div>
                        <span className={`text-xs font-bold ${method === wallet.id ? 'text-emerald-700' : 'text-slate-600'}`}>{wallet.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Atas Nama {isEwallet ? 'E-Wallet' : 'Rekening'}
                </label>
                <input 
                  type="text" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Sesuai profil Anda"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isEwallet ? 'Nomor Handphone' : 'Nomor Rekening'}
                </label>
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  placeholder={isEwallet ? 'Contoh: 081234567890' : 'Contoh: 1234567890'}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium font-mono"
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-800 font-medium leading-relaxed">
                Penarikan dana ke {isEwallet ? 'E-Wallet' : 'Bank'} mungkin memakan waktu 1-3 hari kerja tergantung pada kebijakan masing-masing penyedia layanan.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSubmitting || !amount || !accountName || !accountNumber || Number(amount) < 100000}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {isSubmitting ? 'Memproses...' : 'Ajukan Penarikan Dana'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* MOBILE POPUP NUMPAD (DANA Style) */}
      {showNumpad && (
        <div 
          className="fixed inset-0 z-[100] md:hidden bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setShowNumpad(false)}
        >
          <div 
            className="bg-white w-full rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0.5; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900 text-base">Nominal Tarik Dana</h3>
              <button onClick={() => setShowNumpad(false)} className="text-slate-700 font-bold bg-slate-100 px-3 py-1.5 rounded-full text-xs hover:bg-slate-200">Selesai</button>
            </div>
            
            {/* Display Amount in Numpad */}
            <div className="text-center mb-4 bg-slate-50 py-3 rounded-xl border border-slate-100 flex items-center justify-center gap-1">
              <p className="text-sm font-medium text-slate-500">Rp</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : '0'}
              </p>
            </div>

            {/* Grid Numpad */}
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
              {['1','2','3','4','5','6','7','8','9','000','0'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadInput(num)}
                  className="py-3 text-xl font-bold text-slate-800 bg-white border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-xl hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(prev => prev.slice(0, -1))}
                className="py-3 text-lg font-bold text-slate-800 bg-slate-50 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-xl hover:bg-slate-100 active:bg-slate-200 active:scale-95 transition-all flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
