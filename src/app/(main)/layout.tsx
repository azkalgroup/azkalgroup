"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SidebarNav from '@/components/SidebarNav';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationBell from '@/components/NotificationBell';
import LogoutButton from '@/components/LogoutButton';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string>('U');
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadAvatar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single();
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
        if (data?.full_name) {
          setUserInitials(data.full_name.charAt(0).toUpperCase());
        }
      }
    }
    loadAvatar();
  }, [pathname]);

  return (
    <div className="flex w-full min-h-screen">
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`flex flex-col w-64 bg-slate-50 h-screen fixed left-0 top-0 overflow-y-auto border-r border-slate-200 z-[60] transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">InvestTrack</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Portal Investor</p>
        </div>

        {/* Nav Links */}
        <SidebarNav />

        {/* Bottom Actions */}
        <div className="p-6 space-y-3 mb-4">
          <Link href="/deposit" className="w-full bg-emerald-500 text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            Setor Dana
          </Link>
          <Link href="/withdraw" className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Tarik Dana
          </Link>
          
          <div className="space-y-1 mt-4 pt-4 border-t border-slate-100">
            <Link href="/help" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-slate-500 hover:bg-white/50 hover:text-slate-800 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              Pusat Bantuan
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white w-full py-4 px-5 fixed top-0 z-50 flex justify-between items-center shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-4">
          {/* Avatar Profile */}
          <Link href="/settings" className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </Link>
          
          {/* Mobile Notifications */}
          <Link href="/notifications" className="relative text-slate-500 hover:text-emerald-600 transition-colors p-1.5 rounded-md hover:bg-slate-50">
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </Link>

          {/* Help Center */}
          <Link href="/help" className="text-slate-500 hover:text-slate-700 transition-colors p-1.5 rounded-md hover:bg-slate-50">
            <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
          </Link>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-slate-500 p-2 hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 w-full flex flex-col h-screen overflow-y-auto bg-slate-50 pt-20 md:pt-0">
        {/* DESKTOP TOP NAV */}
        <header className="hidden md:flex bg-white w-full px-8 py-4 justify-between items-center border-b border-slate-200 sticky top-0 z-40">
          <GlobalSearch />
          <div className="flex items-center gap-5 ml-auto">
            <NotificationBell />
            <Link href="/help" className="flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
              <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
            </Link>
            <Link href="/settings" className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden border-2 border-white shadow-sm ml-1 flex-shrink-0 hover:border-slate-200 transition-colors flex items-center justify-center text-emerald-600 font-bold text-base">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitials
              )}
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT WRAPPER */}
        {children}
      </main>
    </div>
  );
}
