"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import AdminSidebarNav from '@/components/AdminSidebarNav';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationBell from '@/components/NotificationBell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function checkRole() {
      const userId = await getUserId();
      if (!userId) {
        router.push('/login');
        return;
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (data?.role !== 'admin') {
        router.push('/');
        return;
      }
      setIsCheckingRole(false);
    }
    checkRole();
  }, [router]);

  if (isCheckingRole) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Verifikasi akses admin...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Admin */}
      <aside className={`w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-[60] shadow-xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:sticky md:flex'}`}>
        
        {/* Brand Admin */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="InvestTrack Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">InvestTrack <span className="text-emerald-500 text-xs ml-1 px-1.5 py-0.5 bg-emerald-500/10 rounded">Admin</span></span>
          </div>
        </div>

        {/* Menu Navigasi Admin */}
        <AdminSidebarNav />

        <div className="p-4 border-t border-slate-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Konten Utama Admin (Kanan) */}
      <main className="flex-1 min-w-0 flex flex-col relative z-0 overflow-y-auto bg-slate-50 md:ml-0 pt-20 md:pt-0">
        
        {/* MOBILE HEADER ADMIN */}
        <header className="md:hidden bg-white w-full py-4 px-5 fixed top-0 z-50 flex justify-between items-center shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-4">
          {/* Avatar Profile */}
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0 block cursor-default">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminConfig&backgroundColor=f8fafc" alt="Admin Avatar" className="w-full h-full object-cover" />
          </div>
          
          {/* Mobile Notifications */}
          <div className="relative text-slate-500 hover:text-emerald-600 transition-colors p-1.5 rounded-md hover:bg-slate-50">
            <NotificationBell mobileMode={true} />
          </div>
        </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-500 p-2 hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>
        
        {/* TOP NAV BAR ADMIN */}
        <header className="hidden md:flex bg-white w-full px-6 lg:px-8 py-4 justify-between items-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <GlobalSearch />
          
          <div className="flex items-center gap-4 lg:gap-5 ml-auto">
            <NotificationBell />
            <Link href="/admin/help" className="flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors" title="Bantuan Admin">
              <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
            </Link>
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            <Link href="/admin/settings" className="flex items-center gap-3 group">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-none mb-0.5 group-hover:text-emerald-600 transition-colors">Admin Panel</p>
                <p className="text-[11px] font-medium text-emerald-600">Superadmin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0 group-hover:border-emerald-200 transition-colors">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminConfig&backgroundColor=f8fafc" alt="Admin Avatar" className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        </header>

        {children}
      </main>

    </div>
  );
}
