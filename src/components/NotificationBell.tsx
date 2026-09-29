"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playNote(880, now, 0.15);
      playNote(1174.66, now + 0.12, 0.15);
      playNote(1318.51, now + 0.24, 0.3);
    } catch(e) {
      console.log('[NotifBell] Sound error:', e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const userId = await getUserId();
    if (!userId) {
      console.log('[NotifBell] No user found');
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);

    console.log('[NotifBell] Fetched:', data?.length, 'notifs, Error:', error?.message);

    if (data && data.length > 0) {
      const mapped = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: formatTime(n.created_at),
        unread: !n.is_read
      }));

      // Cek apakah ada notif baru (bandingkan jumlah unread)
      const newUnreadCount = mapped.filter((n: any) => n.unread).length;
      if (newUnreadCount > prevCountRef.current && prevCountRef.current > 0) {
        console.log('[NotifBell] New notification detected! Playing sound...');
        playNotificationSound();
      }
      prevCountRef.current = newUnreadCount;

      setNotifications(mapped);
    } else if (data && data.length === 0) {
      setNotifications([]);
    }
  }, [playNotificationSound]);

  // Format waktu relatif
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
    // Fetch awal
    fetchNotifications();

    // Realtime subscription (tidak perlu polling jika Realtime aktif)
    let channel: any;
    (async () => {
      try {
        const userId = await getUserId();
        if (!userId) return;

        channel = supabase
          .channel(`notif-${userId}-${Date.now()}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
            (payload) => {
              console.log('[NotifBell] Realtime INSERT:', payload.new);
              fetchNotifications();
              playNotificationSound();
            }
          )
          .subscribe((status: string) => {
            console.log('[NotifBell] Realtime status:', status);
          });
      } catch (e) {
        console.log('[NotifBell] Realtime setup failed:', e);
      }
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications, playNotificationSound]);

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n: any) => ({ ...n, unread: false })));
    prevCountRef.current = 0;
    const userId = await getUserId();
    if (userId) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    }
  };

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button 
        onClick={() => {
          const newOpen = !isOpen;
          setIsOpen(newOpen);
          // Ketika dropdown dibuka, otomatis tandai semua notif sudah dibaca
          if (newOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="flex items-center justify-center text-slate-500 hover:text-slate-700 relative transition-colors focus:outline-none"
      >
        <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-red-500 border-[1.5px] border-white rounded-full leading-none animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Tandai sudah dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? 'bg-emerald-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.unread ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                    <div>
                      <p className={`text-sm ${notif.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.desc}</p>
                      <p className="text-sm font-medium text-slate-400 mt-2">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada notifikasi
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
            <button className="text-xs font-bold text-slate-500 hover:text-slate-700">Lihat Semua Notifikasi</button>
          </div>
        </div>
      )}
    </div>
  );
}
