// reset_projects.mjs — jalankan di folder afgan: node reset_projects.mjs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mtmdajzairoyyykzwxjt.supabase.co';
const supabaseAnonKey = 'sb_publishable_CAV6tTm_IBGj9iELGRP3RA_4FyuWVxJ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // 1. Hapus semua proyek lama
  const { error: delErr } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) { console.error('❌ Gagal hapus proyek:', delErr.message); return; }
  console.log('🗑️  Semua proyek lama berhasil dihapus');

  // 2. Insert proyek baru
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 6);

  const { data, error: insErr } = await supabase.from('projects').insert([
    {
      name: 'Jual Beli HP',
      category: 'Teknologi',
      target_amount: 50000000,
      collected_amount: 0,
      progress: 0,
      investors_count: 0,
      roi: '12% - 18% p.a',
      status: 'Aktif',
      deadline: deadline.toISOString(),
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop',
    },
    {
      name: 'Jual Beli Motor',
      category: 'Otomotif',
      target_amount: 80000000,
      collected_amount: 0,
      progress: 0,
      investors_count: 0,
      roi: '10% - 15% p.a',
      status: 'Aktif',
      deadline: deadline.toISOString(),
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
    },
  ]).select();

  if (insErr) { console.error('❌ Gagal insert proyek baru:', insErr.message); return; }
  console.log('✅ Proyek baru berhasil dibuat:');
  data.forEach(p => console.log(`   - [${p.status}] ${p.name} (Target: Rp ${p.target_amount.toLocaleString('id-ID')})`));
}

main().catch(console.error);
