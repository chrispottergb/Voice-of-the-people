import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface Assertion {
  name: string
  pass: boolean
  detail?: string
}

async function assert(name: string, fn: () => Promise<boolean | { pass: boolean; detail: string }>): Promise<Assertion> {
  try {
    const result = await fn()
    if (typeof result === 'boolean') return { name, pass: result }
    return { name, pass: result.pass, detail: result.detail }
  } catch (err) {
    return { name, pass: false, detail: String(err) }
  }
}

async function countDistricts(type: string): Promise<number> {
  const { count } = await supabase
    .from('districts')
    .select('*', { count: 'exact', head: true })
    .eq('district_type', type)
    .eq('state', 'WI')
  return count ?? 0
}

async function main() {
  console.log('🔍 Validating Wisconsin seed data...\n')

  const assertions: Assertion[] = await Promise.all([
    assert('8 congressional districts', async () => {
      const n = await countDistricts('congressional')
      return { pass: n === 8, detail: `found ${n}` }
    }),
    assert('33 state senate districts', async () => {
      const n = await countDistricts('state_senate')
      return { pass: n === 33, detail: `found ${n}` }
    }),
    assert('99 state assembly districts', async () => {
      const n = await countDistricts('state_assembly')
      return { pass: n === 99, detail: `found ${n}` }
    }),
    assert('72 counties', async () => {
      const n = await countDistricts('county')
      return { pass: n === 72, detail: `found ${n}` }
    }),
    assert('Every district has >= 1 office', async () => {
      const { data: districts } = await supabase.from('districts').select('id')
      const { data: offices } = await supabase.from('offices').select('district_id')
      const districtIds = new Set((districts ?? []).map((d: { id: string }) => d.id))
      const officeDistrictIds = new Set((offices ?? []).map((o: { district_id: string }) => o.district_id))
      const missing = [...districtIds].filter(id => !officeDistrictIds.has(id))
      return { pass: missing.length === 0, detail: `${missing.length} districts missing offices` }
    }),
    assert('No duplicate GEOIDs', async () => {
      const { data } = await supabase.from('districts').select('geoid')
      const geoids = (data ?? []).map((d: { geoid: string }) => d.geoid)
      const unique = new Set(geoids)
      return { pass: unique.size === geoids.length, detail: `${geoids.length - unique.size} duplicates` }
    }),
    assert('All offices have non-null next_election', async () => {
      const { count } = await supabase
        .from('offices')
        .select('*', { count: 'exact', head: true })
        .is('next_election', null)
      const nullCount = count ?? 0
      return { pass: nullCount === 0, detail: `${nullCount} offices missing next_election` }
    }),
  ])

  const passed = assertions.filter(a => a.pass).length
  const failed = assertions.filter(a => !a.pass).length
  const line = '─'.repeat(50)

  console.log(line)
  for (const a of assertions) {
    const icon = a.pass ? '✅' : '❌'
    const detail = a.detail ? ` (${a.detail})` : ''
    console.log(`${icon} ${a.name}${detail}`)
  }
  console.log(line)
  console.log(`Result: ${passed} passed, ${failed} failed`)
  console.log(line)

  if (failed > 0) process.exit(1)
}

main().catch(err => {
  console.error('❌ Validation error:', err)
  process.exit(1)
})
