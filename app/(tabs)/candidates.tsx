import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Profile, Office, District, Level } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateRow = Profile & {
  office?: (Office & { district?: District }) | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Federal', 'State', 'County', 'Municipal'] as const
type Filter = typeof FILTERS[number]

const LEVEL_MAP: Record<Filter, Level | null> = {
  All: null,
  Federal: 'federal',
  State: 'state',
  County: 'county',
  Municipal: 'municipal',
}

const PARTY_COLORS: Record<string, { bg: string; text: string }> = {
  Democrat:    { bg: '#1d3a6e', text: '#60a5fa' },
  Republican:  { bg: '#5a1a1a', text: '#f87171' },
  Independent: { bg: '#2e1a5a', text: '#a78bfa' },
  Green:       { bg: '#0f3325', text: '#34d399' },
  Libertarian: { bg: '#4a3000', text: '#fbbf24' },
}

// ─── Helper: initials from name ───────────────────────────────────────────────

function initials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ url, name }: { url: string | null; name: string | null }) {
  const [errored, setErrored] = useState(false)
  if (url && !errored) {
    return (
      <Image
        source={{ uri: url }}
        style={s.avatar}
        onError={() => setErrored(true)}
      />
    )
  }
  return (
    <View style={[s.avatar, s.avatarFallback]}>
      <Text style={s.avatarInitials}>{initials(name)}</Text>
    </View>
  )
}

// ─── Party badge ──────────────────────────────────────────────────────────────

function PartyBadge({ party }: { party: string | null }) {
  if (!party) return null
  const colors = PARTY_COLORS[party] ?? { bg: '#1e1e2e', text: '#888' }
  return (
    <View style={[s.partyBadge, { backgroundColor: colors.bg }]}>
      <Text style={[s.partyText, { color: colors.text }]}>{party}</Text>
    </View>
  )
}

// ─── Candidate card ───────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  onAsk,
  onSeeResponses,
}: {
  candidate: CandidateRow
  onAsk: (c: CandidateRow) => void
  onSeeResponses: (c: CandidateRow) => void
}) {
  const name = candidate.display_name || candidate.full_name
  const officeTitle = candidate.office?.title ?? null
  const districtName = candidate.office?.district?.name ?? null

  return (
    <View style={s.card}>
      {/* Header row */}
      <View style={s.cardHeader}>
        <Avatar url={candidate.avatar_url} name={name} />
        <View style={s.cardHeaderInfo}>
          <Text style={s.name} numberOfLines={1}>{name ?? 'Unknown Candidate'}</Text>
          <PartyBadge party={candidate.party} />
        </View>
      </View>

      {/* Office + District */}
      {(officeTitle || districtName) && (
        <View style={s.metaRow}>
          {officeTitle && (
            <Text style={s.officeTitleText} numberOfLines={1}>{officeTitle}</Text>
          )}
          {officeTitle && districtName && (
            <Text style={s.metaSep}> · </Text>
          )}
          {districtName && (
            <Text style={s.districtText} numberOfLines={1}>{districtName}</Text>
          )}
        </View>
      )}

      {/* Bio */}
      {candidate.bio ? (
        <Text style={s.bio} numberOfLines={2}>{candidate.bio}</Text>
      ) : null}

      {/* Action buttons */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.btnOutline}
          activeOpacity={0.7}
          onPress={() => onAsk(candidate)}
        >
          <Text style={s.btnOutlineText}>Ask a Question</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnFilled}
          activeOpacity={0.7}
          onPress={() => onSeeResponses(candidate)}
        >
          <Text style={s.btnFilledText}>See Responses</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CandidatesTab() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [filter, setFilter] = useState<Filter>('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Get current user's district IDs
    const { data: profile } = await supabase
      .from('profiles')
      .select('district_ids')
      .eq('id', user.id)
      .single()

    const districtIds: string[] = profile?.district_ids ?? []

    // Fetch candidates joined with their office (which has district)
    let query = supabase
      .from('profiles')
      .select('*, office:offices(*, district:districts(*))')
      .eq('role', 'candidate')
      .order('created_at', { ascending: false })
      .limit(200)

    if (districtIds.length > 0) {
      query = query.in('district_id', districtIds)
    }

    const { data, error } = await query

    if (!error && data) {
      setCandidates(data as unknown as CandidateRow[])
    }
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  // Client-side filter by office level
  const visible = candidates.filter((c) => {
    const level = LEVEL_MAP[filter]
    if (!level) return true
    return c.office?.level === level
  })

  // Placeholder handlers — wire up navigation in a real app
  const handleAsk = (_c: CandidateRow) => { /* navigate to ask question */ }
  const handleSeeResponses = (_c: CandidateRow) => { /* navigate to responses */ }

  if (loading) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator size="large" color="#4f7dff" />
      </View>
    )
  }

  return (
    <View style={s.container}>
      {/* Title */}
      <View style={s.titleBar}>
        <Text style={s.title}>Candidates in Your Districts</Text>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={s.filterBarContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            activeOpacity={0.7}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Candidate list */}
      <FlatList
        data={visible}
        keyExtractor={(c) => c.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4f7dff"
            colors={['#4f7dff']}
          />
        }
        renderItem={({ item }) => (
          <CandidateCard
            candidate={item}
            onAsk={handleAsk}
            onSeeResponses={handleSeeResponses}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🗳️</Text>
            <Text style={s.emptyTitle}>No candidates yet</Text>
            <Text style={s.emptyBody}>No candidates in your districts yet.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#08080f',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title
  titleBar: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#08080f',
    borderBottomWidth: 1,
    borderBottomColor: '#12122a',
  },
  title: {
    color: '#e2e2ef',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Filter bar
  filterBar: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#12122a',
    backgroundColor: '#08080f',
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  filterChipActive: {
    backgroundColor: '#1a2a5e',
    borderColor: '#4f7dff',
  },
  filterChipText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#4f7dff',
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },

  // Card
  card: {
    backgroundColor: '#0d0d1a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 4,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    backgroundColor: '#1a2a5e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#4f7dff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Name
  name: {
    color: '#e2e2ef',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },

  // Party badge
  partyBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  partyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Meta row (office + district)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  officeTitleText: {
    color: '#9090b0',
    fontSize: 13,
    fontWeight: '600',
  },
  metaSep: {
    color: '#444',
    fontSize: 13,
  },
  districtText: {
    color: '#666',
    fontSize: 13,
  },

  // Bio
  bio: {
    color: '#5a5a7a',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  // Action buttons
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252540',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btnOutlineText: {
    color: '#8888aa',
    fontSize: 12,
    fontWeight: '600',
  },
  btnFilled: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#4f7dff',
  },
  btnFilledText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#9090b0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})
