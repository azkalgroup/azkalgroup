"use client";

import { useState } from 'react';
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

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BCA');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isEwallet = ewallets.some(w => w.id === method);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountName || !accountNumber) return;
    
    setIsSubmitting(true);
    const userId = await getUserId();
    if (!userId) return;

    const numAmount = Number(amount.replace(/\D/g, ''));
    const { error } = await supabase.from('transactions').insert([{
      user_id: userId,
      type: 'withdraw',
      amount: numAmount,
      status: 'pending'
    }]);

    if (!error) {
      await supabase.from('notifications').insert([{
        user_id: userId,
        title: '⏳ Permintaan Tarik Dana',
        message: `Permintaan tarik dana Anda sebesar Rp ${numAmount.toLocaleString('id-ID')} sedang diproses oleh admin.`,
      }]);
    }

    setIsSubmitting(false);

    if (error) {
      alert("Gagal membuat permintaan penarikan: " + error.message);
    } else {
      alert("Permintaan penarikan berhasil dibuat. Dana akan ditransfer setelah disetujui Admin.");
      router.push('/transactions');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tarik Dana</h1>
        <p className="text-slate-500 font-medium mt-2">Tarik saldo keuntungan atau modal investasi Anda ke rekening bank atau E-Wallet.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Penarikan (Rp)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">Rp</span>
                </div>
                <input 
                  type="text" 
                  value={amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : ''}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500 font-medium">Minimal penarikan Rp 100.000</p>
                <p 
                  className="text-xs text-emerald-600 font-bold cursor-pointer hover:text-emerald-700"
                  onClick={() => setAmount('15000000')}
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
                        onClick={() => setMethod(bank.id)}
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
                        onClick={() => setMethod(wallet.id)}
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
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
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
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
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
    </div>
  );
}
