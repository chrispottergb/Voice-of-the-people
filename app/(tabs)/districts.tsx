import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { District, DistrictType } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<DistrictType, string> = {
  congressional: '#3b82f6',
  state_senate: '#10b981',
  state_assembly: '#8b5cf6',
  county: '#f97316',
  municipal: '#14b8a6',
}

const TYPE_LABEL: Record<DistrictType, string> = {
  congressional: 'Congressional',
  state_senate: 'Senate',
  state_assembly: 'Assembly',
  county: 'County',
  municipal: 'Municipal',
}

type SectionKey = 'Federal' | 'State' | 'Local'

const SECTION_MAP: Record<DistrictType, SectionKey> = {
  congressional: 'Federal',
  state_senate: 'State',
  state_assembly: 'State',
  county: 'Local',
  municipal: 'Local',
}

const SECTION_ORDER: SectionKey[] = ['Federal', 'State', 'Local']

const TYPE_ORDER: DistrictType[] = [
  'congressional',
  'state_senate',
  'state_assembly',
  'county',
  'municipal',
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <View style={[s.card, s.skeletonCard]}>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={s.skeletonName} />
        <View style={s.skeletonBadge} />
      </View>
      <View style={s.skeletonArrow} />
    </View>
  )
}

function SkeletonSection({ label }: { label: string }) {
  return (
    <View>
      <View style={s.skeletonSectionHeader} />
      <SkeletonCard />
      {label === 'State' && <SkeletonCard />}
    </View>
  )
}

function LoadingSkeleton() {
  return (
    <View style={[s.container]}>
      <Text style={s.title}>My Voting Districts</Text>
      <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 8 }}>
        <SkeletonSection label="Federal" />
        <SkeletonSection label="State" />
        <SkeletonSection label="Local" />
      </View>
    </View>
  )
}

// ─── District Card ────────────────────────────────────────────────────────────

function DistrictCard({ district }: { district: District }) {
  const color = TYPE_COLOR[district.district_type] ?? '#555'
  const label = TYPE_LABEL[district.district_type] ?? district.district_type

  function handlePress() {
    router.push({
      pathname: '/district/[id]' as never,
      params: { id: district.id },
    })
  }

  return (
    <Pressable
      style={({ pressed }) => [
        s.card,
        { borderLeftColor: color },
        pressed && s.cardPressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${district.name}, ${label} district`}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.districtName}>{district.name}</Text>
        <View style={[s.badge, { backgroundColor: color + '22' }]}>
          <Text style={[s.badgeText, { color }]}>{label}</Text>
        </View>
      </View>
      <Text style={s.arrow}>›</Text>
    </Pressable>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Section = {
  title: SectionKey
  data: District[]
}

export default function DistrictsTab() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) {
            setError('Not signed in.')
            setLoading(false)
          }
          return
        }

        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('district_ids')
          .eq('id', user.id)
          .single()

        if (profileErr || !profile) {
          if (!cancelled) {
            setError('Could not load profile.')
            setLoading(false)
          }
          return
        }

        if (!profile.district_ids?.length) {
          if (!cancelled) {
            setSections([])
            setLoading(false)
          }
          return
        }

        const { data: districts, error: distErr } = await supabase
          .from('districts')
          .select('*')
          .in('id', profile.district_ids)

        if (distErr || !districts) {
          if (!cancelled) {
            setError('Could not load districts.')
            setLoading(false)
          }
          return
        }

        // Group by section, preserving type order within each section
        const buckets: Record<SectionKey, District[]> = {
          Federal: [],
          State: [],
          Local: [],
        }

        // Sort districts by TYPE_ORDER so cards appear in consistent order
        const sorted = [...districts].sort((a, b) => {
          return (
            TYPE_ORDER.indexOf(a.district_type) -
            TYPE_ORDER.indexOf(b.district_type)
          )
        })

        for (const d of sorted) {
          const section = SECTION_MAP[d.district_type]
          if (section) buckets[section].push(d)
        }

        const built: Section[] = SECTION_ORDER.filter(
          key => buckets[key].length > 0
        ).map(key => ({ title: key, data: buckets[key] }))

        if (!cancelled) {
          setSections(built)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError('An unexpected error occurred.')
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <SafeAreaView style={s.container}>
      <SectionList<District, Section>
        sections={sections}
        keyExtractor={d => d.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={<Text style={s.title}>My Voting Districts</Text>}
        renderSectionHeader={({ section }) => (
          <Text style={s.sectionHeader}>{section.title.toUpperCase()}</Text>
        )}
        renderSectionFooter={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <DistrictCard district={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🗺️</Text>
            <Text style={s.emptyTitle}>No Districts Linked</Text>
            <Text style={s.emptyBody}>
              Verify your address to automatically link your voting districts.
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={s.updateBtn}
            onPress={() => router.push('/(auth)/verify-address')}
            activeOpacity={0.75}
          >
            <Text style={s.updateBtnText}>Update My Address</Text>
          </TouchableOpacity>
        }
      />
      {error && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08080f',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 0,
  },
  title: {
    color: '#e2e2ef',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    color: '#555570',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0d0d1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPressed: {
    backgroundColor: '#11111f',
    opacity: 0.85,
  },
  districtName: {
    color: '#dcdcf0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 7,
    letterSpacing: -0.1,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  arrow: {
    color: '#3a3a55',
    fontSize: 22,
    marginLeft: 12,
    lineHeight: 24,
  },

  // Skeleton
  skeletonCard: {
    borderLeftColor: '#1e1e30',
    opacity: 0.6,
  },
  skeletonSectionHeader: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#1a1a2e',
    marginBottom: 10,
    marginTop: 4,
  },
  skeletonName: {
    width: '65%',
    height: 14,
    borderRadius: 5,
    backgroundColor: '#1a1a2e',
  },
  skeletonBadge: {
    width: 80,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#1a1a2e',
  },
  skeletonArrow: {
    width: 12,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#1a1a2e',
    marginLeft: 12,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    color: '#9090b0',
    fontSize: 17,
    fontWeight: '600',
  },
  emptyBody: {
    color: '#555570',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Update button
  updateBtn: {
    marginTop: 32,
    backgroundColor: '#12122a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  updateBtnText: {
    color: '#a0a0d0',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Error banner
  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#2a0a0a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#5a1a1a',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
  },
})
