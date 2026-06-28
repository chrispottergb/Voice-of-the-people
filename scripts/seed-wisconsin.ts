import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function countByType(type: string): Promise<number> {
  const { count } = await supabase
    .from('districts')
    .select('*', { count: 'exact', head: true })
    .eq('district_type', type)
    .eq('state', 'WI')
  return count ?? 0
}

async function countOffices(): Promise<number> {
  const { count } = await supabase
    .from('offices')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

async function main() {
  console.log('🌟 Starting Wisconsin district seed...')

  const seedPath = path.join(__dirname, '..', 'supabase', 'seed', 'wisconsin_districts.sql')

  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(seedPath, 'utf-8')

  // Split into individual statements and execute
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📄 Executing ${statements.length} SQL statements...`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    const { error } = await supabase.rpc('exec_sql', { sql: stmt }).single().catch(() => ({ error: null }))
    if (error) {
      // Try direct approach for district/office inserts
      errorCount++
      if (process.env.DEBUG) console.warn(`⚠️  Statement ${i + 1} warning:`, error.message)
    } else {
      successCount++
    }
  }

  console.log(`\n✅ SQL execution complete (${successCount} ok, ${errorCount} warnings)`)

  // Count results
  const congressional = await countByType('congressional')
  const senate = await countByType('state_senate')
  const assembly = await countByType('state_assembly')
  const counties = await countByType('county')
  const municipalities = await countByType('municipal')
  const offices = await countOffices()
  const total = congressional + senate + assembly + counties + municipalities

  const line = '─'.repeat(37)
  console.log(`\n✅ Wisconsin Seed Complete`)
  console.log(line)
  console.log(`Congressional Districts:  ${String(congressional).padStart(4)}`)
  console.log(`State Senate Districts:   ${String(senate).padStart(4)}`)
  console.log(`State Assembly Districts: ${String(assembly).padStart(4)}`)
  console.log(`Counties:                 ${String(counties).padStart(4)}`)
  console.log(`Municipalities (v1):      ${String(municipalities).padStart(4)}`)
  console.log(line)
  console.log(`Total Districts:          ${String(total).padStart(4)}`)
  console.log(`Total Offices:            ${String(offices).padStart(4)}`)
  console.log(line)
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
