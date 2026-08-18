/**
 * Seed script — creates initial admin user for local development
 */
const bcrypt = require('bcryptjs')
const { writeTable, readTable } = require('./store')

async function seed() {
  const users = readTable('users')
  if (users.length > 0) {
    console.log('⏭️  Users already seeded, skipping')
    return
  }

  const hash = await bcrypt.hash('nawaz1234', 10)
  const admin = {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'Nawaz Khan',
    email: 'nawaz@kmcardeals.com',
    password: hash,
    role: 'admin',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  writeTable('users', [admin])
  console.log('✅ Admin user seeded: nawaz@kmcardeals.com / nawaz1234')
}

module.exports = seed
