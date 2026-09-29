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
  { id: 'QRIS', name: 'QRIS', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg', color: '#ED2C25' },
];

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BCA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsSubmitting(true);
    const userId = await getUserId();
    if (!userId) return;

    const numAmount = Number(amount.replace(/\D/g, ''));
    const { error } = await supabase.from('transactions').insert([{
      investor_id: userId,
      type: 'deposit',
      amount: numAmount,
      status: 'pending'
    }]);

    setIsSubmitting(false);

    if (error) {
      alert("Gagal membuat permintaan deposit: " + error.message);
    } else {
      alert("Permintaan deposit berhasil dibuat. Silakan tunggu konfirmasi Admin.");
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Setor Dana</h1>
        <p className="text-slate-500 font-medium mt-2">Tambah saldo investasi Anda dengan mudah dan aman.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Penyetoran (Rp)</label>
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
              <p className="text-xs text-slate-500 font-medium mt-2">Minimal penyetoran Rp 1.000.000</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">Pilih Metode Pembayaran</label>
              
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

                {/* E-Wallet & QRIS */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">E-Wallet & QRIS</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

            {/* Info Box */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                Setelah Anda menekan tombol di bawah, Anda akan diarahkan ke WhatsApp Admin kami untuk mendapatkan nomor rekening tujuan transfer atau QR code demi keamanan transaksi Anda.
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
                {isSubmitting ? 'Memproses...' : 'Buat Permintaan Deposit'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
