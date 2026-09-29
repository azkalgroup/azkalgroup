"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Menghapus cookie auth-token dengan cara menyetel expired ke masa lalu
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Arahkan ke halaman login
    router.push('/login');
    // Refresh router untuk memastikan middleware berjalan ulang
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout} 
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-slate-500 hover:bg-white/50 hover:text-slate-800 font-medium text-left"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Keluar
    </button>
  );
}
