"use client";

import Link from 'next/link';

export default function NotificationsMobilePage() {
  const notifications: any[] = [];

  return (
    <div className="flex-1 w-full p-5 pt-5 min-h-screen bg-slate-50 md:hidden animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Notifikasi</h2>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map((notif) => (
          <div key={notif.id} className={`p-4 rounded-xl border ${notif.read ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-100'} flex gap-4 items-start shadow-sm`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bg} ${notif.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={notif.icon} /></svg>
            </div>
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-800' : 'text-slate-900'}`}>{notif.title}</h4>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{notif.desc}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Belum ada notifikasi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
