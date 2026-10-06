import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtmdajzairoyyykzwxjt.supabase.co',
  'sb_publishable_CAV6tTm_IBGj9iELGRP3RA_4FyuWVxJ'
);

async function testNotif() {
  console.log('Testing notifications table...');
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Fetch success, table exists. Data:', data);
  }
}

testNotif();
