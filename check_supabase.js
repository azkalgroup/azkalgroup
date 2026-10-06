// check_supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtmdajzairoyyykzwxjt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CAV6tTm_IBGj9iELGRP3RA_4FyuWVxJ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function logTable(name) {
  const { data, error } = await supabase.from(name).select('*').limit(5);
  if (error) console.log(`❌ Error fetching ${name}:`, error.message);
  else console.log(`📊 ${name}:`, data);
}

async function main() {
  const tables = ['profiles', 'investors', 'notifications', 'transactions', 'projects'];
  for (const t of tables) await logTable(t);

  const { data: invData, error: invError } = await supabase
    .from('investors')
    .select('*, profiles(*)')
    .limit(5);
  if (invError) console.log('❌ Investors link error:', invError.message);
  else console.log('🔗 investors with linked profiles:', invData);
}

main().catch(console.error);
