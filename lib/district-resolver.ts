import CryptoJS from 'crypto-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { District, DistrictResolutionResult } from './types'

const CIVIC_API_BASE = 'https://civicinfo.googleapis.com/civicinfo/v2'
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

interface UpstashRedis {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, opts?: { ex?: number }) => Promise<void>
}

function getRedisClient(): UpstashRedis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  return {
    async get(key: string) {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { result: string | null }
      return json.result
    },
    async set(key: string, value: string, opts?: { ex?: number }) {
      const path = opts?.ex ? `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${opts.ex}` : `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`
      await fetch(`${url}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    },
  }
}

function hashAddress(address: string): string {
  return CryptoJS.SHA256(address.toLowerCase().trim()).toString()
}

interface CivicResponse {
  divisions?: Record<string, { name: string }>
}

function mapOcdToGeoid(ocdId: string): string | null {
  // ocd-division/country:us/state:wi/cd:1 -> 5000US5501
  const cdMatch = ocdId.match(/country:us\/state:wi\/cd:(\d+)$/)
  if (cdMatch) {
    const n = parseInt(cdMatch[1], 10)
    return `5000US550${n}`
  }
  // ocd-division/country:us/state:wi/sldu:1 -> SLU5500001
  const slduMatch = ocdId.match(/country:us\/state:wi\/sldu:(\d+)$/)
  if (slduMatch) {
    const n = parseInt(slduMatch[1], 10).toString().padStart(3, '0')
    return `SLU5500${n}`
  }
  // ocd-division/country:us/state:wi/sldl:1 -> SLL5500001
  const slldMatch = ocdId.match(/country:us\/state:wi\/sldl:(\d+)$/)
  if (slldMatch) {
    const n = parseInt(slldMatch[1], 10).toString().padStart(3, '0')
    return `SLL5500${n}`
  }
  // ocd-division/country:us/state:wi/county:dane -> WI-COUNTY-dane
  const countyMatch = ocdId.match(/country:us\/state:wi\/county:([a-z_]+)$/)
  if (countyMatch) {
    return `WI-COUNTY-${countyMatch[1].replace(/_/g, '-')}`
  }
  // ocd-division/country:us/state:wi/place:madison -> WI-MUNI-madison
  const placeMatch = ocdId.match(/country:us\/state:wi\/place:([a-z_]+)$/)
  if (placeMatch) {
    return `WI-MUNI-${placeMatch[1].replace(/_/g, '-')}`
  }
  return null
}

export async function resolveWisconsinDistricts(
  address: string,
  supabase: SupabaseClient
): Promise<DistrictResolutionResult> {
  const addressHash = hashAddress(address)
  const cacheKey = `district:resolve:${addressHash}`
  const redis = getRedisClient()

  // Check cache
  if (redis) {
    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log('District resolution from cache')
      return JSON.parse(cached) as DistrictResolutionResult
    }
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) throw new Error('GOOGLE_CIVIC_API_KEY not set')

  const url = `${CIVIC_API_BASE}/representatives?address=${encodeURIComponent(address)}&key=${apiKey}`
  const civicRes = await fetch(url)
  if (!civicRes.ok) {
    throw new Error(`Civic API error: ${civicRes.status} ${civicRes.statusText}`)
  }
  const civicData = await civicRes.json() as CivicResponse
  const divisions = civicData.divisions ?? {}

  const geoids = Object.keys(divisions)
    .map(mapOcdToGeoid)
    .filter((g): g is string => g !== null)

  if (geoids.length === 0) {
    return { congressional: null, state_senate: null, state_assembly: null, county: null, municipal: null, all_district_ids: [] }
  }

  const { data: districts, error } = await supabase
    .from('districts')
    .select('*')
    .in('geoid', geoids)

  if (error) throw new Error(`Supabase error: ${error.message}`)

  const result: DistrictResolutionResult = {
    congressional: (districts ?? []).find((d: District) => d.district_type === 'congressional') ?? null,
    state_senate: (districts ?? []).find((d: District) => d.district_type === 'state_senate') ?? null,
    state_assembly: (districts ?? []).find((d: District) => d.district_type === 'state_assembly') ?? null,
    county: (districts ?? []).find((d: District) => d.district_type === 'county') ?? null,
    municipal: (districts ?? []).find((d: District) => d.district_type === 'municipal') ?? null,
    all_district_ids: (districts ?? []).map((d: District) => d.id),
  }

  // Cache result
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL_SECONDS })
  }

  return result
}
