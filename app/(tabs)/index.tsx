import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Question, Profile } from '@/lib/types'

const C = {
  bg: '#0d0d1a',
  surface: '#13131f',
  surfaceAlt: '#0f0f1c',
  border: '#1e1e30',
  text: '#e2e2ef',
  dim: '#666',
  dimMid: '#888',
  accent: '#4f7dff',
  accentDim: '#4f7dff18',
  accentBorder: '#4f7dff33',
  green: '#10b981',
  yellow: '#f59e0b',
}

interface QuestionRow extends Question {
  candidate: Pick<Profile, 'display_name' | 'full_name'> | null
  district: { name: string } | null
}

export default function HomeTab() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(p)

    if (p?.district_ids?.length) {
      const { data: q } = await supabase
        .from('questions')
        .select(`
          *,
          candidate:candidate_id(display_name, full_name),
          district:district_id(name)
        `)
        .eq('status', 'approved')
        .in('district_id', p.district_ids)
        .order('created_at', { ascending: false })
        .limit(10)
      setQuestions((q as QuestionRow[]) ?? [])
    } else {
      setQuestions([])
    }
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const hasDistricts = (profile?.district_ids?.length ?? 0) > 0
  const districtCount = profile?.district_ids?.length ?? 0
  const displayName = profile?.display_name || profile?.full_name || 'there'

  if (loading) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    )
  }

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.welcomeLabel}>Welcome back,</Text>
            <Text style={s.welcomeName}>{displayName}</Text>
          </View>
          <View style={s.stateIcon}>
            <Text style={s.stateIconText}>🦅</Text>
            <Text style={s.stateIconLabel}>WI</Text>
          </View>
        </View>
        <Text style={s.headerSub}>Wisconsin Civic Platform</Text>
      </View>

      {/* Summary Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.cardsRow}
      >
        <View style={[s.summaryCard, { borderTopColor: C.accent }]}>
          <Text style={[s.cardCount, { color: C.accent }]}>{districtCount}</Text>
          <Text style={s.cardTitle}>My Districts</Text>
          <Text style={s.cardSub}>
            {districtCount === 1 ? 'district tracked' : 'districts tracked'}
          </Text>
        </View>

        <View style={[s.summaryCard, { borderTopColor: C.green }]}>
          <Text style={[s.cardCount, { color: C.green }]}>{questions.length}</Text>
          <Text style={s.cardTitle}>Open Questions</Text>
          <Text style={s.cardSub}>in your districts</Text>
        </View>

        <View style={[s.summaryCard, { borderTopColor: C.yellow }]}>
          <Text style={[s.cardCount, { color: C.yellow }]}>—</Text>
          <Text style={s.cardTitle}>Candidates Near You</Text>
          <Text style={s.cardSub}>coming soon</Text>
        </View>
      </ScrollView>

      {/* No districts CTA */}
      {!hasDistricts && (
        <TouchableOpacity
          style={s.setupCard}
          onPress={() => router.push('/(auth)/verify-address')}
          activeOpacity={0.8}
        >
          <Text style={s.setupEmoji}>📍</Text>
          <View style={s.setupText}>
            <Text style={s.setupTitle}>Set up your districts</Text>
            <Text style={s.setupSub}>
              Enter your address to see candidates and questions in your area
            </Text>
          </View>
          <Text style={s.setupArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Section heading */}
      {hasDistricts && (
        <Text style={s.sectionLabel}>RECENT QUESTIONS IN YOUR DISTRICTS</Text>
      )}
    </View>
  )

  return (
    <View style={s.container}>
      <FlatList
        data={hasDistricts ? questions : []}
        keyExtractor={q => q.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.accent}
          />
        }
        ListHeaderComponent={ListHeader}
        contentContainerStyle={s.listContent}
        renderItem={({ item: q }) => {
          const candidateName =
            (q.candidate as any)?.display_name ||
            (q.candidate as any)?.full_name ||
            'Unknown Candidate'
          const districtName = (q.district as any)?.name || ''

          return (
            <TouchableOpacity
              style={s.questionCard}
              onPress={() => router.push('/(tabs)/questions')}
              activeOpacity={0.75}
            >
              <Text style={s.questionBody} numberOfLines={2}>
                {q.body}
              </Text>
              <View style={s.questionMeta}>
                <View style={s.questionMetaLeft}>
                  <Text style={s.questionCandidate} numberOfLines={1}>
                    {candidateName}
                  </Text>
                  {!!districtName && (
                    <Text style={s.questionDistrict} numberOfLines={1}>
                      {districtName}
                    </Text>
                  )}
                </View>
                <View style={s.upvoteChip}>
                  <Text style={s.upvoteText}>▲ {q.upvotes}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          hasDistricts ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No questions yet</Text>
              <Text style={s.emptyText}>
                No approved questions in your districts yet.
              </Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => router.push('/(tabs)/questions')}
              >
                <Text style={s.emptyBtnText}>Ask the first question →</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 32 },

  // Header
  header: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  welcomeLabel: { color: C.dimMid, fontSize: 13, marginBottom: 2 },
  welcomeName: { color: C.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: C.dim, fontSize: 12, marginTop: 4 },
  stateIcon: { alignItems: 'center', backgroundColor: C.accentDim, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.accentBorder },
  stateIconText: { fontSize: 18 },
  stateIconLabel: { color: C.accent, fontSize: 10, fontWeight: '800', marginTop: 2, letterSpacing: 1 },

  // Summary cards
  cardsRow: { gap: 10, paddingBottom: 14, paddingRight: 4 },
  summaryCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 3,
    width: 140,
  },
  cardCount: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  cardTitle: { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  cardSub: { color: C.dim, fontSize: 11 },

  // Setup card
  setupCard: {
    backgroundColor: C.accentDim,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.accentBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  setupEmoji: { fontSize: 24 },
  setupText: { flex: 1 },
  setupTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  setupSub: { color: C.dimMid, fontSize: 12, lineHeight: 17 },
  setupArrow: { color: C.accent, fontSize: 22, fontWeight: '300' },

  // Section label
  sectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },

  // Question card
  questionCard: {
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  questionBody: { color: C.text, fontSize: 14, lineHeight: 21, marginBottom: 10 },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  questionMetaLeft: { flex: 1, marginRight: 10 },
  questionCandidate: { color: C.accent, fontSize: 12, fontWeight: '700' },
  questionDistrict: { color: C.dim, fontSize: 11, marginTop: 2 },
  upvoteChip: {
    backgroundColor: C.accentDim,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  upvoteText: { color: C.accent, fontSize: 11, fontWeight: '700' },

  separator: { height: 10 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, gap: 8 },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  emptyText: { color: C.dim, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: C.accentDim,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  emptyBtnText: { color: C.accent, fontWeight: '700', fontSize: 13 },
})
