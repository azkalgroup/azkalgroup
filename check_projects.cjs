const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const i = line.indexOf('=');
  if (i > -1) {
    env[line.substring(0, i).trim()] = line.substring(i + 1).trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkProjects() {
  const { data: srData, error: srError } = await supabase.from('projects').select('name');
  console.log('Projects (Service Role):', srData?.length || srError);

  const { data: anonData, error: anonError } = await anonSupabase.from('projects').select('name');
  console.log('Projects (Anon Key):', anonData?.length || anonError);
}

checkProjects();
