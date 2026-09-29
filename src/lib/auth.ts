import { supabase } from './supabase';

// Cache user ID di memory agar tidak perlu network request setiap halaman
let cachedUserId: string | null = null;

/**
 * Ambil user ID dari session lokal (tidak ada network request).
 * Jauh lebih cepat dari supabase.auth.getUser() yang selalu hit server.
 */
export async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  const { data } = await supabase.auth.getSession();
  cachedUserId = data.session?.user?.id ?? null;
  return cachedUserId;
}

/**
 * Ambil user email dari session lokal.
 */
export async function getUserEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email ?? null;
}

/**
 * Clear cache ketika user logout.
 */
export function clearUserCache() {
  cachedUserId = null;
}

// Otomatis clear cache saat sesi berubah (logout/login)
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    clearUserCache();
  }
});
