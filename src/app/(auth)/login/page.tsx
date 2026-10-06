"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Gagal masuk: " + error.message);
    } else if (data.user) {
      document.cookie = "auth-token=true; path=/"; // Mock cookie for layout
      
      // Mengambil data role dari tabel profiles di Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        alert("Gagal mengambil data profil: " + profileError.message);
      }

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 12px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -18px); }
        }
        @keyframes shimmer {
          0% { opacity: 0.05; }
          50% { opacity: 0.15; }
          100% { opacity: 0.05; }
        }
        .anim-fade-up {
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        .anim-slide-right {
          opacity: 0;
          animation: slideInRight 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-float {
          animation: float 8s ease-in-out infinite;
        }
        .anim-float-slow {
          animation: floatSlow 10s ease-in-out infinite;
        }
        .anim-shimmer {
          animation: shimmer 4s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen w-full flex bg-white font-sans text-slate-800 absolute inset-0 z-[100]">
        
        {/* KIRI: FORM LOGIN */}
        <div className="w-full lg:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 py-12 justify-center h-full min-h-screen relative z-10">
          <div className="w-full max-w-md mx-auto">
            
            {/* Logo Brand */}
            <div 
              className={`flex flex-col items-center gap-2.5 mb-12 ${mounted ? 'anim-fade-up' : 'opacity-0'}`} 
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-24 h-24 flex items-center justify-center">
                <img src="/logo.png" alt="InvestTrack Logo" className="w-full h-full object-contain drop-shadow-xl" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 hidden">InvestTrack</span>
            </div>

            <h1 
              className={`text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 tracking-tight ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.2s' }}
            >
              Masuk
            </h1>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Input Email */}
              <div 
                className={mounted ? 'anim-fade-up' : 'opacity-0'} 
                style={{ animationDelay: '0.3s' }}
              >
                <label className="block text-sm font-bold text-slate-900 mb-2.5">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@gmail.com" 
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div 
                className={mounted ? 'anim-fade-up' : 'opacity-0'} 
                style={{ animationDelay: '0.4s' }}
              >
                <label className="block text-sm font-bold text-slate-900 mb-2.5">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-14 pl-12 pr-12 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium transition-all shadow-sm"
                    id="login-password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.29c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 01-4.243-4.243m4.243 4.243L8 8" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div 
                className={`flex items-center pt-1 ${mounted ? 'anim-fade-up' : 'opacity-0'}`} 
                style={{ animationDelay: '0.5s' }}
              >
                <input type="checkbox" id="remember" className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer" />
                <label htmlFor="remember" className="ml-2.5 text-sm text-slate-700 font-bold cursor-pointer select-none">Ingat saya</label>
              </div>

              {/* Submit Button */}
              <div 
                className={`pt-2 ${mounted ? 'anim-fade-up' : 'opacity-0'}`} 
                style={{ animationDelay: '0.6s' }}
              >
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-base hover:bg-emerald-500 hover:shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* KANAN: AREA PRESENTASI HERO */}
        <div className="hidden lg:flex lg:w-1/2 p-5 h-screen items-center justify-center">
          
          {/* Giant Card Container */}
          <div 
            className={`w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] relative flex flex-col justify-center px-10 xl:px-16 overflow-hidden ${mounted ? 'anim-slide-right' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            
            {/* Dekorasi Latar: Grafik Investasi Naik (Bullish Chart) */}
            <div className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none z-0">
              <svg viewBox="0 0 1000 400" className="w-full h-full text-emerald-500/10" preserveAspectRatio="none">
                <path d="M0,400 L0,300 C150,300 250,150 400,200 C550,250 700,50 850,100 C950,130 1000,0 1000,0 L1000,400 Z" fill="currentColor" />
                <path d="M0,300 C150,300 250,150 400,200 C550,250 700,50 850,100 C950,130 1000,0" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500/20" />
              </svg>
            </div>

            {/* Dekorasi halus - gradient circles dengan animasi float */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none anim-float"></div>
            <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-slate-700/30 rounded-full blur-[100px] pointer-events-none anim-float-slow"></div>
            
            {/* Garis diagonal tipis dengan shimmer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[25%] right-[-20%] w-[140%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transform -rotate-[35deg] anim-shimmer"></div>
              <div className="absolute top-[55%] right-[-20%] w-[140%] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent transform -rotate-[35deg] anim-shimmer" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Floating Element 1: Badge Kepercayaan (Trust) */}
            <div className="absolute top-[12%] right-[8%] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 z-0 anim-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wide">Terlindungi</p>
                <p className="text-slate-400 text-xs mt-0.5">Enkripsi Tingkat Bank</p>
              </div>
            </div>

            {/* Floating Element 2: Mini Chart Pertumbuhan (Investment Growth) */}
            <div className="absolute bottom-[40%] right-[5%] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-44 z-0 anim-float-slow" style={{ animationDelay: '2s' }}>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Profit</p>
                  <p className="text-white font-bold text-sm">+24.8%</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </div>
              </div>
              {/* Simple SVG Chart */}
              <svg className="w-full h-8 text-emerald-400" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,30 L0,20 C10,20 20,25 30,15 C40,5 50,25 60,15 C70,5 80,10 100,0 L100,30 Z" fill="currentColor" opacity="0.2"/>
                <path d="M0,20 C10,20 20,25 30,15 C40,5 50,25 60,15 C70,5 80,10 100,0" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            {/* Konten Hero */}
            <div className="relative z-10 w-full max-w-xl mx-auto">
              <div className="mb-12">
                <div 
                  className={`flex items-center gap-3 mb-8 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="h-[2px] w-8 bg-emerald-400 rounded-full"></div>
                  <span className="font-bold text-emerald-400 tracking-widest text-xs uppercase">InvestTrack</span>
                </div>
                <h1 
                  className={`text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-5 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
                  style={{ animationDelay: '0.6s' }}
                >
                  Selamat Datang<br/>di InvestTrack
                </h1>
                <p 
                  className={`text-base text-slate-400 leading-relaxed font-medium max-w-md ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
                  style={{ animationDelay: '0.7s' }}
                >
                  Platform analitik kelas atas untuk membangun portofolio yang terorganisir. Mulai pantau masa depan keuangan Anda.
                </p>
                <div 
                  className={`flex items-center gap-3 mt-6 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
                  style={{ animationDelay: '0.8s' }}
                >
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/30 border-2 border-slate-800"></div>
                    <div className="w-7 h-7 rounded-full bg-blue-500/30 border-2 border-slate-800"></div>
                    <div className="w-7 h-7 rounded-full bg-amber-500/30 border-2 border-slate-800"></div>
                  </div>
                  <p className="text-slate-500 font-medium text-xs">
                    <strong className="text-slate-300">17,000+</strong> investor bergabung.
                  </p>
                </div>
              </div>

              {/* Kartu Presentasi */}
              <div 
                className={`bg-white/[0.07] backdrop-blur-sm rounded-2xl p-7 relative overflow-hidden border border-white/10 hover:bg-white/[0.1] hover:border-white/15 transition-all duration-500 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.9s' }}
              >
                <div className="relative z-10">
                  <h2 className="text-xl xl:text-2xl font-bold text-white mb-3 tracking-tight leading-snug">
                    Dapatkan wawasan akurat dan mulai investasi Anda.
                  </h2>
                  
                  <div className="flex justify-between items-end gap-4 mt-6">
                    <p className="text-slate-400 font-medium leading-relaxed text-sm max-w-[220px]">
                      Rasakan cara termudah mengelola aset digital Anda.
                    </p>
                    
                    {/* Avatar Grup */}
                    <div className="flex -space-x-2.5 shrink-0">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=e2e8f0" alt="User 1" className="w-9 h-9 rounded-full border-2 border-slate-800 shadow-sm" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=cbd5e1" alt="User 2" className="w-9 h-9 rounded-full border-2 border-slate-800 shadow-sm" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=94a3b8" alt="User 3" className="w-9 h-9 rounded-full border-2 border-slate-800 shadow-sm" />
                      <div className="w-9 h-9 rounded-full border-2 border-slate-800 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                        +2
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
