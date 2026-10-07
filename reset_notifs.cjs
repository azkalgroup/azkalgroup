const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mtmdajzairoyyykzwxjt.supabase.co';
const supabaseAnonKey = 'sb_publishable_CAV6tTm_IBGj9iELGRP3RA_4FyuWVxJ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetNotifs() {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all records

  console.log('Deleted notifications:', data);
  if (error) console.error('Error deleting:', error);
}

resetNotifs();
