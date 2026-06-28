import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, RefreshControl, Switch, Modal, Pressable,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Question, Profile } from '@/lib/types'

const TABS = ['Browse', 'My Questions', 'Ask'] as const
type Tab = typeof TABS[number]

const TOPICS = [
  'Economy', 'Healthcare', 'Education', 'Housing',
  'Environment', 'Public Safety', 'Infrastructure', 'Other',
]

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  flagged: '#ef4444',
  removed: '#666',
}

type BrowseFilter = 'all' | 'with_responses'

export default function QuestionsTab() {
  const [tab, setTab] = useState<Tab>('Browse')
  const [questions, setQuestions] = useState<Question[]>([])
  const [myQuestions, setMyQuestions] = useState<Question[]>([])
  const [candidates, setCandidates] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('all')

  // Ask form state
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [questionBody, setQuestionBody] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isAnon, setIsAnon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showCandidatePicker, setShowCandidatePicker] = useState(false)
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('district_ids, district_id')
      .eq('id', user.id)
      .single()

    const districtIds: string[] = profile?.district_ids ?? []

    const [qRes, myQRes, cRes, upvoteRes] = await Promise.all([
      supabase
        .from('questions')
        .select('*, candidate:candidate_id(display_name, full_name, party), response_count')
        .eq('status', 'approved')
        .in('district_id', districtIds)
        .order('upvotes', { ascending: false })
        .limit(100),
      supabase
        .from('questions')
        .select('*')
        .eq('voter_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate')
        .in('district_id', districtIds),
      supabase
        .from('question_upvotes')
        .select('question_id')
        .eq('voter_id', user.id),
    ])

    setQuestions((qRes.data as Question[]) ?? [])
    setMyQuestions((myQRes.data as Question[]) ?? [])
    setCandidates((cRes.data as Profile[]) ?? [])
    setUpvotedIds(
      new Set((upvoteRes.data ?? []).map((r: any) => r.question_id))
    )
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleUpvote(q: Question) {
    if (upvotedIds.has(q.id)) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [, updateRes] = await Promise.all([
      supabase.from('question_upvotes').insert({ question_id: q.id, voter_id: user.id }),
      supabase.from('questions').update({ upvotes: (q.upvotes ?? 0) + 1 }).eq('id', q.id),
    ])
    if (!updateRes.error) {
      setUpvotedIds(prev => new Set([...prev, q.id]))
      setQuestions(prev =>
        prev.map(item =>
          item.id === q.id ? { ...item, upvotes: (item.upvotes ?? 0) + 1 } : item
        )
      )
    }
  }

  async function handleSubmit() {
    if (!questionBody.trim() || !selectedCandidate || submitting) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('district_id')
      .eq('id', user.id)
      .single()

    await supabase.from('questions').insert({
      voter_id: isAnon ? null : user.id,
      candidate_id: selectedCandidate,
      district_id: profile?.district_id ?? '',
      body: questionBody.trim(),
      topic_tags: selectedTopics,
      is_anonymous: isAnon,
      status: 'pending',
      upvotes: 0,
    })

    setQuestionBody('')
    setSelectedCandidate('')
    setSelectedTopics([])
    setIsAnon(false)
    setSubmitSuccess(true)
    setSubmitting(false)
    setTimeout(() => {
      setSubmitSuccess(false)
      setTab('My Questions')
      load()
    }, 2200)
  }

  const selectedCandidateProfile = candidates.find(c => c.id === selectedCandidate)

  const filteredQuestions = browseFilter === 'with_responses'
    ? questions.filter(q => (q as any).response_count > 0)
    : questions

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#4f7dff" size="large" />
      </View>
    )
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Questions</Text>
      </View>

      {/* Tab row */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Browse tab */}
      {tab === 'Browse' && (
        <>
          {/* Filter row */}
          <View style={s.filterRow}>
            <TouchableOpacity
              style={[s.filterChip, browseFilter === 'all' && s.filterChipActive]}
              onPress={() => setBrowseFilter('all')}
            >
              <Text style={[s.filterChipText, browseFilter === 'all' && s.filterChipTextActive]}>
                All Questions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.filterChip, browseFilter === 'with_responses' && s.filterChipActive]}
              onPress={() => setBrowseFilter('with_responses')}
            >
              <Text style={[s.filterChipText, browseFilter === 'with_responses' && s.filterChipTextActive]}>
                With Responses
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredQuestions}
            keyExtractor={q => q.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4f7dff" />
            }
            renderItem={({ item: q }) => {
              const candidateObj = (q as any).candidate
              const candidateName = candidateObj?.display_name || candidateObj?.full_name || 'Candidate'
              const responseCount: number = (q as any).response_count ?? 0
              const alreadyUpvoted = upvotedIds.has(q.id)

              return (
                <View style={s.qCard}>
                  <Text style={s.qBody} numberOfLines={5}>{q.body}</Text>

                  {/* Topic tags */}
                  {q.topic_tags && q.topic_tags.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginBottom: 10 }}
                      contentContainerStyle={{ gap: 6 }}
                    >
                      {q.topic_tags.map((tag: string) => (
                        <View key={tag} style={s.tagPill}>
                          <Text style={s.tagPillText}>{tag}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  <View style={s.qFooter}>
                    <Text style={s.qCandidate}>To: {candidateName}</Text>
                    <View style={s.qFooterRight}>
                      {responseCount > 0 && (
                        <View style={s.responsePill}>
                          <Text style={s.responsePillText}>
                            {responseCount} {responseCount === 1 ? 'response' : 'responses'}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[s.upvoteBtn, alreadyUpvoted && s.upvoteBtnActive]}
                        onPress={() => handleUpvote(q)}
                        disabled={alreadyUpvoted}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.upvoteText, alreadyUpvoted && s.upvoteTextActive]}>
                          ▲ {q.upvotes ?? 0}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>💬</Text>
                <Text style={s.emptyText}>
                  {browseFilter === 'with_responses'
                    ? 'No questions with responses yet.'
                    : 'No approved questions in your districts yet.'}
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* My Questions tab */}
      {tab === 'My Questions' && (
        <FlatList
          data={myQuestions}
          keyExtractor={q => q.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4f7dff" />
          }
          renderItem={({ item: q }) => (
            <View style={s.qCard}>
              <View style={s.myQHeader}>
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[q.status] ?? '#555') + '22' }]}>
                  <Text style={[s.statusText, { color: STATUS_COLOR[q.status] ?? '#888' }]}>
                    {q.status.toUpperCase()}
                  </Text>
                </View>
                {q.is_anonymous && (
                  <View style={s.anonBadge}>
                    <Text style={s.anonBadgeText}>Anonymous</Text>
                  </View>
                )}
              </View>
              <Text style={s.qBody} numberOfLines={4}>{q.body}</Text>
              {q.topic_tags && q.topic_tags.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {q.topic_tags.map((tag: string) => (
                    <View key={tag} style={s.tagPill}>
                      <Text style={s.tagPillText}>{tag}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📝</Text>
              <Text style={s.emptyText}>You haven't submitted any questions yet.</Text>
              <TouchableOpacity style={s.askNowBtn} onPress={() => setTab('Ask')}>
                <Text style={s.askNowBtnText}>Ask a Question</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Ask tab */}
      {tab === 'Ask' && (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {submitSuccess && (
            <View style={s.successBanner}>
              <Text style={s.successText}>Question submitted! It is now pending review.</Text>
            </View>
          )}

          {/* Candidate picker */}
          <View>
            <Text style={s.fieldLabel}>CANDIDATE</Text>
            <TouchableOpacity
              style={s.candidatePicker}
              onPress={() => setShowCandidatePicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  selectedCandidateProfile
                    ? s.candidatePickerSelected
                    : s.candidatePickerPlaceholder
                }
              >
                {selectedCandidateProfile
                  ? (selectedCandidateProfile.display_name || selectedCandidateProfile.full_name)
                  : 'Choose a candidate…'}
              </Text>
              <Text style={{ color: '#555', fontSize: 16 }}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Question body */}
          <View>
            <View style={s.fieldLabelRow}>
              <Text style={s.fieldLabel}>YOUR QUESTION</Text>
              <Text style={[s.charCount, questionBody.length >= 450 && s.charCountWarn]}>
                {questionBody.length}/500
              </Text>
            </View>
            <TextInput
              style={s.textarea}
              value={questionBody}
              onChangeText={t => setQuestionBody(t.slice(0, 500))}
              placeholder="Ask something specific and respectful…"
              placeholderTextColor="#3a3a55"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Topics */}
          <View>
            <Text style={s.fieldLabel}>TOPICS</Text>
            <View style={s.topicGrid}>
              {TOPICS.map(topic => {
                const active = selectedTopics.includes(topic)
                return (
                  <TouchableOpacity
                    key={topic}
                    style={[s.topicChip, active && s.topicChipActive]}
                    onPress={() =>
                      setSelectedTopics(prev =>
                        active ? prev.filter(t => t !== topic) : [...prev, topic]
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={[s.topicText, active && s.topicTextActive]}>{topic}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Anonymous toggle */}
          <View style={s.anonRow}>
            <View>
              <Text style={s.fieldLabel}>ANONYMOUS</Text>
              <Text style={s.anonHint}>Your name won't appear publicly</Text>
            </View>
            <Switch
              value={isAnon}
              onValueChange={setIsAnon}
              trackColor={{ false: '#1e1e30', true: '#4f7dff' }}
              thumbColor="#fff"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              s.submitBtn,
              (!questionBody.trim() || !selectedCandidate || submitting) && s.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!questionBody.trim() || !selectedCandidate || submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>Submit Question</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Candidate picker modal */}
      <Modal
        visible={showCandidatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCandidatePicker(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setShowCandidatePicker(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Select Candidate</Text>
          {candidates.length === 0 ? (
            <Text style={s.emptyText}>No candidates found in your districts.</Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {candidates.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.modalItem, selectedCandidate === c.id && s.modalItemActive]}
                  onPress={() => { setSelectedCandidate(c.id); setShowCandidatePicker(false) }}
                  activeOpacity={0.7}
                >
                  <View style={s.modalItemAvatar}>
                    <Text style={s.modalItemAvatarText}>
                      {((c.display_name || c.full_name) ?? '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.modalItemText}>{c.display_name || c.full_name}</Text>
                    {c.party && <Text style={s.modalItemSub}>{c.party}</Text>}
                  </View>
                  {selectedCandidate === c.id && <Text style={{ color: '#4f7dff', fontSize: 18 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08080f',
  },

  // Header
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#08080f',
    borderBottomWidth: 1,
    borderColor: '#12121e',
  },
  headerTitle: {
    color: '#e2e2ef',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#1a1a2a',
    backgroundColor: '#0d0d18',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderColor: '#4f7dff',
  },
  tabText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4f7dff',
  },

  // Browse filter row
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#12121e',
    backgroundColor: '#0a0a14',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0d0d18',
    borderWidth: 1,
    borderColor: '#1e1e30',
  },
  filterChipActive: {
    backgroundColor: '#4f7dff18',
    borderColor: '#4f7dff',
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#4f7dff',
  },

  // Question card
  qCard: {
    backgroundColor: '#0d0d18',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a2a',
  },
  qBody: {
    color: '#e2e2ef',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  qFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  qFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qCandidate: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  responsePill: {
    backgroundColor: '#10b98118',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  responsePillText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  upvoteBtn: {
    backgroundColor: '#4f7dff14',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#4f7dff30',
  },
  upvoteBtnActive: {
    backgroundColor: '#4f7dff28',
    borderColor: '#4f7dff',
  },
  upvoteText: {
    color: '#4f7dff',
    fontSize: 12,
    fontWeight: '700',
  },
  upvoteTextActive: {
    color: '#6f9dff',
  },

  // Topic tag pills
  tagPill: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagPillText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '500',
  },

  // My Questions
  myQHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  anonBadge: {
    backgroundColor: '#55555520',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  anonBadgeText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  askNowBtn: {
    marginTop: 12,
    backgroundColor: '#4f7dff18',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4f7dff40',
  },
  askNowBtnText: {
    color: '#4f7dff',
    fontWeight: '700',
    fontSize: 13,
  },

  // Ask form
  fieldLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  charCount: {
    color: '#444',
    fontSize: 12,
    fontWeight: '500',
  },
  charCountWarn: {
    color: '#f59e0b',
  },
  candidatePicker: {
    backgroundColor: '#0d0d18',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidatePickerPlaceholder: {
    color: '#3a3a55',
    fontSize: 14,
  },
  candidatePickerSelected: {
    color: '#e2e2ef',
    fontSize: 14,
    fontWeight: '600',
  },
  textarea: {
    backgroundColor: '#0d0d18',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#e2e2ef',
    fontSize: 14,
    lineHeight: 21,
    minHeight: 130,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0d0d18',
    borderWidth: 1,
    borderColor: '#1e1e30',
  },
  topicChipActive: {
    backgroundColor: '#4f7dff1a',
    borderColor: '#4f7dff',
  },
  topicText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  topicTextActive: {
    color: '#4f7dff',
  },
  anonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d0d18',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e30',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  anonHint: {
    color: '#3a3a55',
    fontSize: 11,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#4f7dff',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  successBanner: {
    backgroundColor: '#10b98118',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10b98150',
    alignItems: 'center',
  },
  successText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Candidate picker modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000aa',
  },
  modalSheet: {
    backgroundColor: '#0f0f1c',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '65%',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#e2e2ef',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: '#14141f',
  },
  modalItemActive: {
    backgroundColor: '#4f7dff08',
  },
  modalItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e1e30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemAvatarText: {
    color: '#4f7dff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalItemText: {
    color: '#e2e2ef',
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemSub: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
})
