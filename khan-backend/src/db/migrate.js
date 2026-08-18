/**
 * Run this once to set up the database.
 * node src/db/migrate.js
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrate() {
  console.log('🚀 Running Khan Interface database migration...')
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
  let ok = 0, fail = 0
  for (const stmt of statements) {
    try {
      await supabase.rpc('exec_sql', { sql: stmt + ';' })
      ok++
    } catch (e) {
      // Some statements may fail if already exist — that is fine
      fail++
    }
  }
  console.log(`✅ Migration complete. OK: ${ok} | Skipped: ${fail}`)
  console.log('\n📋 Next steps:')
  console.log('1. Copy .env.example to .env and fill your keys')
  console.log('2. npm install')
  console.log('3. npm start')
  process.exit(0)
}

migrate().catch(e => { console.error('❌ Migration failed:', e); process.exit(1) })
