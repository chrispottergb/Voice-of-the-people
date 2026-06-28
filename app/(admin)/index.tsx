import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, ActivityIndicator, Dimensions, RefreshControl,
  Modal, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Profile, District } from '@/lib/types'

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#08080f',
  surface: '#0d0d18',
  border: '#1a1a2a',
  muted: '#333',
  text: '#e2e2ef',
  dim: '#666',
  accent: '#6366f1',
  accentDim: '#6366f120',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
}

// ─── Sparkline (SVG-style via View) ──────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80, H = 28
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = W / (data.length - 1)
  const points = data.map((v, i) => ({
    x: i * step,
    y: H - ((v - min) / range) * H,
  }))

  return (
    <View style={{ width: W, height: H }}>
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1]
        const dx = next.x - p.x
        const dy = next.y - p.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: len,
              height: 1.5,
              backgroundColor: color,
              transformOrigin: 'left center',
              transform: [{ rotate: `${angle}deg` }],
              opacity: 0.9,
            }}
          />
        )
      })}
    </View>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────
interface MetricProps {
  label: string
  value: string
  trend: string
  up: boolean
  sparkData: number[]
  color: string
}
function MetricCard({ label, value, trend, up, sparkData, color }: MetricProps) {
  return (
    <View style={ms.card}>
      <Text style={ms.label}>{label}</Text>
      <Text style={ms.value}>{value}</Text>
      <View style={ms.bottom}>
        <View style={[ms.badge, { backgroundColor: up ? '#10b98118' : '#ef444418' }]}>
          <Text style={[ms.trend, { color: up ? C.green : C.red }]}>{trend}</Text>
        </View>
        <Sparkline data={sparkData} color={color} />
      </View>
    </View>
  )
}
const ms = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 150,
  },
  label: { color: C.dim, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  value: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 10 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  trend: { fontSize: 11, fontWeight: '700' },
})

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ role }: { role: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    voter: { label: 'Voter', bg: '#3b82f618', text: '#60a5fa' },
    candidate: { label: 'Candidate', bg: '#10b98118', text: '#34d399' },
    admin: { label: 'Admin', bg: '#6366f118', text: '#818cf8' },
  }
  const s = map[role] ?? map.voter
  return (
    <View style={[ps.pill, { backgroundColor: s.bg }]}>
      <Text style={[ps.text, { color: s.text }]}>{s.label}</Text>
    </View>
  )
}
const ps = StyleSheet.create({
  pill: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: '600' },
})

// ─── User drawer ──────────────────────────────────────────────────────────────
function UserDrawer({ user, onClose }: { user: Profile | null; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'questions' | 'audit'>('overview')
  if (!user) return null

  const tabs = ['overview', 'questions', 'audit'] as const

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={dr.backdrop} onPress={onClose} />
      <View style={dr.drawer}>
        <View style={dr.handle} />
        <View style={dr.header}>
          <View style={dr.avatar}>
            <Text style={dr.avatarText}>
              {(user.display_name || user.full_name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={dr.name}>{user.display_name || user.full_name || 'Unknown'}</Text>
            <StatusPill role={user.role} />
          </View>
          <TouchableOpacity onPress={onClose} style={dr.closeBtn}>
            <Text style={dr.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={dr.tabs}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[dr.tab, tab === t && dr.tabActive]}
            >
              <Text style={[dr.tabText, tab === t && dr.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={dr.content}>
          {tab === 'overview' && (
            <View>
              {[
                ['User ID', user.id],
                ['Role', user.role],
                ['Verified Voter', user.verified_voter ? '✅ Yes' : '❌ No'],
                ['Identity Verified', user.identity_verified ? '✅ Yes' : '❌ No'],
                ['Subscription', user.sub_status],
                ['Party', user.party ?? '—'],
                ['Joined', new Date(user.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <View key={k as string} style={dr.row}>
                  <Text style={dr.rowKey}>{k}</Text>
                  <Text style={dr.rowVal} numberOfLines={1}>{v as string}</Text>
                </View>
              ))}
              {user.bio && (
                <View style={dr.bioBox}>
                  <Text style={dr.bioText}>{user.bio}</Text>
                </View>
              )}
            </View>
          )}
          {tab === 'questions' && (
            <View style={dr.emptyTab}>
              <Text style={dr.emptyTabText}>Questions submitted by this user will appear here.</Text>
            </View>
          )}
          {tab === 'audit' && (
            <View style={dr.codeBlock}>
              <Text style={dr.codeText}>{JSON.stringify(user, null, 2)}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}
const dr = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000088' },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  handle: { width: 36, height: 4, backgroundColor: C.muted, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: C.accent, fontWeight: '700', fontSize: 18 },
  name: { color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  closeBtn: { padding: 8 },
  closeText: { color: C.dim, fontSize: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: C.border, paddingHorizontal: 16 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 4 },
  tabActive: { borderBottomWidth: 2, borderColor: C.accent },
  tabText: { color: C.dim, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: C.accent },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: C.border },
  rowKey: { color: C.dim, fontSize: 12, fontWeight: '600' },
  rowVal: { color: C.text, fontSize: 12, maxWidth: '60%', textAlign: 'right' },
  bioBox: { backgroundColor: '#0a0a14', borderRadius: 8, padding: 12, marginTop: 12 },
  bioText: { color: C.dim, fontSize: 13, lineHeight: 18 },
  emptyTab: { padding: 24, alignItems: 'center' },
  emptyTabText: { color: C.dim, fontSize: 13, textAlign: 'center' },
  codeBlock: { backgroundColor: '#050508', borderRadius: 8, padding: 12 },
  codeText: { color: '#7c8cf8', fontSize: 11, fontFamily: 'monospace' },
})

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'voter' | 'candidate' | 'admin'>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState({
    voters: 0, candidates: 0, questions: 0, districts: 0,
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const loadData = useCallback(async () => {
    const [usersRes, questionsRes, districtsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('districts').select('*', { count: 'exact', head: true }),
    ])

    const allUsers = usersRes.data ?? []
    setUsers(allUsers)
    setFiltered(allUsers)
    setMetrics({
      voters: allUsers.filter(u => u.role === 'voter').length,
      candidates: allUsers.filter(u => u.role === 'candidate').length,
      questions: questionsRes.count ?? 0,
      districts: districtsRes.count ?? 0,
    })
  }, [])

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [loadData])

  useEffect(() => {
    let list = users
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter)
    if (search) list = list.filter(u =>
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
  }, [search, roleFilter, users])

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/(auth)/login')
  }

  const sparkVoters = [12, 19, 14, 28, 22, 35, 41, 38, 52, 61, 58, 74]
  const sparkCandidates = [2, 3, 3, 5, 4, 7, 8, 6, 9, 11, 10, 14]
  const sparkQuestions = [0, 5, 8, 12, 9, 18, 22, 19, 31, 28, 40, metrics.questions]
  const sparkDistricts = Array(12).fill(metrics.districts)

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.accent} size="large" />
        <Text style={[s.dim, { marginTop: 12 }]}>Loading admin console…</Text>
      </View>
    )
  }

  const ROLES = ['all', 'voter', 'candidate', 'admin'] as const

  return (
    <View style={s.shell}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      {!sidebarCollapsed && (
        <View style={s.sidebar}>
          <View style={s.sidebarTop}>
            <View style={s.workspace}>
              <View style={s.wsIcon}><Text style={s.wsIconText}>V</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.wsName}>Voice of the People</Text>
                <Text style={s.wsRole}>Admin Console</Text>
              </View>
            </View>

            <View style={s.navSection}>
              {[
                { label: 'Dashboard', icon: '⬛', active: true },
                { label: 'Users', icon: '👤', active: false },
                { label: 'Districts', icon: '🗺', active: false },
                { label: 'Questions', icon: '💬', active: false },
                { label: 'Upload', icon: '📤', active: false, onPress: () => router.push('/(admin)/upload') },
                { label: 'Audit Log', icon: '📋', active: false },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.navItem, item.active && s.navItemActive]}
                  onPress={item.onPress}
                >
                  <Text style={s.navIcon}>{item.icon}</Text>
                  <Text style={[s.navLabel, item.active && s.navLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.sidebarBottom}>
            <View style={s.userDeck}>
              <View style={s.deckAvatar}><Text style={s.deckAvatarText}>A</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.deckName}>Administrator</Text>
                <Text style={s.deckRole}>System Admin</Text>
              </View>
              <TouchableOpacity onPress={handleSignOut}>
                <Text style={s.signOut}>↪</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── Main area ───────────────────────────────────────────────── */}
      <View style={s.main}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSidebarCollapsed(c => !c)} style={s.menuBtn}>
            <Text style={s.menuBtnText}>☰</Text>
          </TouchableOpacity>
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbText}>Admin</Text>
            <Text style={s.breadcrumbSep}>/</Text>
            <Text style={s.breadcrumbCurrent}>Dashboard</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.uploadBtn}
              onPress={() => router.push('/(admin)/upload')}
            >
              <Text style={s.uploadBtnText}>⬆ Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.accent} />}
        >
          {/* Metrics */}
          <Text style={s.sectionLabel}>Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.metricsRow}>
            <View style={s.metricsInner}>
              <MetricCard label="REGISTERED VOTERS" value={String(metrics.voters)} trend="+8.2% this month" up sparkData={sparkVoters} color={C.blue} />
              <MetricCard label="CANDIDATES" value={String(metrics.candidates)} trend="+3 this week" up sparkData={sparkCandidates} color={C.green} />
              <MetricCard label="QUESTIONS" value={String(metrics.questions)} trend="+12.4% vs last month" up sparkData={sparkQuestions} color={C.accent} />
              <MetricCard label="DISTRICTS" value={String(metrics.districts)} trend="232 total" up sparkData={sparkDistricts} color={C.yellow} />
            </View>
          </ScrollView>

          {/* User table */}
          <View style={s.tableHeader}>
            <Text style={s.sectionLabel}>Users</Text>
            <Text style={s.tableCount}>{filtered.length} results</Text>
          </View>

          {/* Filter bar */}
          <View style={s.filterBar}>
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search users…"
              placeholderTextColor={C.muted}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.rolePills}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[s.rolePill, roleFilter === r && s.rolePillActive]}
                  onPress={() => setRoleFilter(r)}
                >
                  <Text style={[s.rolePillText, roleFilter === r && s.rolePillTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Table rows */}
          <View style={s.table}>
            <View style={s.tableHeadRow}>
              <Text style={[s.tableHead, { flex: 2 }]}>Name</Text>
              <Text style={[s.tableHead, { flex: 1 }]}>Role</Text>
              <Text style={[s.tableHead, { flex: 1.2 }]}>Joined</Text>
              <Text style={[s.tableHead, { width: 32 }]}> </Text>
            </View>

            {filtered.length === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyText}>No users match filters</Text>
              </View>
            )}

            {filtered.map((u, i) => (
              <TouchableOpacity
                key={u.id}
                style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}
                onPress={() => setSelectedUser(u)}
                activeOpacity={0.7}
              >
                <View style={[s.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <View style={s.rowAvatar}>
                    <Text style={s.rowAvatarText}>
                      {((u.display_name || u.full_name || '?')[0]).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={s.rowName} numberOfLines={1}>
                      {u.display_name || u.full_name || 'Unknown'}
                    </Text>
                    {u.verified_voter && <Text style={s.verifiedBadge}>✓ Verified</Text>}
                  </View>
                </View>
                <View style={[s.tableCell, { flex: 1 }]}>
                  <StatusPill role={u.role} />
                </View>
                <Text style={[s.tableCell, s.cellText, { flex: 1.2 }]}>
                  {new Date(u.created_at).toLocaleDateString()}
                </Text>
                <Text style={[s.tableCell, { width: 32, color: C.dim }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </View>

      <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
    </View>
  )
}

const s = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  dim: { color: C.dim, fontSize: 13 },

  // Sidebar
  sidebar: {
    width: 220,
    backgroundColor: C.surface,
    borderRightWidth: 1,
    borderColor: C.border,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sidebarTop: { flex: 1 },
  workspace: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  wsIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  wsIconText: { color: C.accent, fontWeight: '800', fontSize: 16 },
  wsName: { color: C.text, fontWeight: '700', fontSize: 13 },
  wsRole: { color: C.dim, fontSize: 10 },
  navSection: { padding: 8, paddingTop: 12 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6,
  },
  navItemActive: { backgroundColor: C.accentDim },
  navIcon: { fontSize: 14 },
  navLabel: { color: C.dim, fontSize: 13, fontWeight: '500' },
  navLabelActive: { color: C.accent, fontWeight: '700' },
  sidebarBottom: { borderTopWidth: 1, borderColor: C.border, padding: 12 },
  userDeck: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deckAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  deckAvatarText: { color: C.accent, fontWeight: '700' },
  deckName: { color: C.text, fontSize: 12, fontWeight: '600' },
  deckRole: { color: C.dim, fontSize: 10 },
  signOut: { color: C.dim, fontSize: 18, padding: 4 },

  // Main
  main: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderBottomWidth: 1, borderColor: C.border,
    backgroundColor: C.surface,
  },
  menuBtn: { padding: 6 },
  menuBtnText: { color: C.dim, fontSize: 16 },
  breadcrumb: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  breadcrumbText: { color: C.dim, fontSize: 13 },
  breadcrumbSep: { color: C.muted, fontSize: 13 },
  breadcrumbCurrent: { color: C.text, fontSize: 13, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  uploadBtn: {
    backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  uploadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  scroll: { flex: 1, padding: 16 },
  sectionLabel: { color: C.dim, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  metricsRow: { marginBottom: 24 },
  metricsInner: { flexDirection: 'row', gap: 10 },

  // Table
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tableCount: { color: C.dim, fontSize: 11 },
  filterBar: { gap: 8, marginBottom: 12 },
  searchInput: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, padding: 10, color: C.text, fontSize: 13,
  },
  rolePills: { flexGrow: 0 },
  rolePill: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, marginRight: 6,
  },
  rolePillActive: { backgroundColor: C.accentDim, borderColor: C.accent },
  rolePillText: { color: C.dim, fontSize: 12, fontWeight: '600' },
  rolePillTextActive: { color: C.accent },
  table: { backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  tableHeadRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 14, borderBottomWidth: 1, borderColor: C.border,
  },
  tableHead: { color: C.dim, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  tableRowAlt: { backgroundColor: '#0a0a14' },
  tableCell: { justifyContent: 'center' },
  cellText: { color: C.text, fontSize: 12 },
  rowAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  rowAvatarText: { color: C.accent, fontWeight: '700', fontSize: 12 },
  rowName: { color: C.text, fontSize: 13, fontWeight: '600' },
  verifiedBadge: { color: C.green, fontSize: 10 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { color: C.dim, fontSize: 13 },
})
