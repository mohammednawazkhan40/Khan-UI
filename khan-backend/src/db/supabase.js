const { createLocalClient } = require('./store')

let supabase, supabaseAnon

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Real Supabase
  const { createClient } = require('@supabase/supabase-js')
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  console.log('✅ Using Supabase database')
} else {
  // Local JSON file store
  supabase = createLocalClient()
  supabaseAnon = createLocalClient()
  console.log('✅ Using local JSON file store (data/ directory)')
}

module.exports = { supabase, supabaseAnon }
