"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';

export default function NotificationsMobilePage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const userId = await getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id,title,message,is_read,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      const mapped = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: formatTime(n.created_at),
        read: n.is_read,
        icon: n.title.includes('Tolak') ? 'M6 18L18 6M6 6l12 12' : n.title.includes('Setuju') ? 'M5 13l4 4L19 7' : 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        bg: n.title.includes('Tolak') ? 'bg-red-100' : n.title.includes('Setuju') ? 'bg-emerald-100' : 'bg-blue-100',
        color: n.title.includes('Tolak') ? 'text-red-500' : n.title.includes('Setuju') ? 'text-emerald-500' : 'text-blue-500',
      }));
      setNotifications(mapped);
    } else {
      setNotifications([]);
    }
    setLoading(false);
  }, []);

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  useEffect(() => {
    fetchNotifications();

    let channel: any;
    (async () => {
      const userId = await getUserId();
      if (!userId) return;

      channel = supabase
        .channel(`page-notif-${userId}-${Math.random()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return (
    <div className="flex-1 w-full p-5 pt-5 min-h-screen bg-slate-50 md:hidden animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Notifikasi</h2>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium animate-pulse">Memuat notifikasi...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
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
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Belum ada notifikasi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
