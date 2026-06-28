export type DistrictType = 'congressional' | 'state_senate' | 'state_assembly' | 'county' | 'municipal'
export type UserRole = 'voter' | 'candidate' | 'admin'
export type QuestionStatus = 'pending' | 'approved' | 'flagged' | 'removed'
export type ResponseStatus = 'draft' | 'published' | 'removed'
export type Level = 'federal' | 'state' | 'county' | 'municipal'

export interface District {
  id: string
  geoid: string
  name: string
  state: string
  district_type: DistrictType
  boundary: Record<string, unknown> | null
  population: number | null
  created_at: string
}

export interface Office {
  id: string
  district_id: string
  title: string
  level: Level
  term_years: number | null
  is_partisan: boolean
  seats: number
  election_cycle: string | null
  next_election: string | null
  created_at: string
  district?: District
}

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  district_ids: string[] | null
  district_id: string | null
  address_hash: string | null
  verified_voter: boolean
  office_id: string | null
  party: string | null
  campaign_url: string | null
  identity_verified: boolean
  persona_inquiry_id: string | null
  stripe_customer_id: string | null
  stripe_sub_id: string | null
  sub_status: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  voter_id: string | null
  candidate_id: string
  district_id: string
  office_id: string | null
  body: string
  topic_tags: string[] | null
  upvotes: number
  status: QuestionStatus
  moderation_note: string | null
  is_anonymous: boolean
  created_at: string
  candidate?: Profile
  district?: District
  voter?: Profile | null
}

export interface Response {
  id: string
  question_id: string
  candidate_id: string
  body: string | null
  video_url: string | null
  video_duration: number | null
  status: ResponseStatus
  created_at: string
  updated_at: string
}

export interface DistrictResolutionResult {
  congressional: District | null
  state_senate: District | null
  state_assembly: District | null
  county: District | null
  municipal: District | null
  all_district_ids: string[]
}

export interface Database {
  public: {
    Tables: {
      districts: { Row: District; Insert: Omit<District, 'id' | 'created_at'>; Update: Partial<Omit<District, 'id'>> }
      offices: { Row: Office; Insert: Omit<Office, 'id' | 'created_at'>; Update: Partial<Omit<Office, 'id'>> }
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Omit<Profile, 'id'>> }
      questions: { Row: Question; Insert: Omit<Question, 'id' | 'created_at' | 'upvotes'>; Update: Partial<Omit<Question, 'id'>> }
      responses: { Row: Response; Insert: Omit<Response, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Response, 'id'>> }
    }
  }
}
