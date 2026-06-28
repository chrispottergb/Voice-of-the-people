import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { TERMS_VERSION } from '@/legal/terms-of-service'
import { PRIVACY_POLICY_VERSION } from '@/legal/privacy-policy'
import { DATA_SHARING_VERSION } from '@/legal/data-sharing-policy'

const DOCS = [
  {
    key: 'terms',
    title: 'Terms of Service',
    summary: 'Platform rules, paid political advertising policies, candidate and voter conduct guidelines, and dispute resolution.',
    route: '/(legal)/terms',
  },
  {
    key: 'privacy',
    title: 'Privacy Policy',
    summary: 'How we collect, use, and protect your personal data, including district matching and political ad targeting.',
    route: '/(legal)/privacy',
  },
  {
    key: 'data',
    title: 'Data Sharing & Security Policy',
    summary: 'What data we share with candidates and advertisers, our security measures, and your rights.',
    route: '/(legal)/data-sharing',
  },
] as const

export default function TermsAcceptance() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({ terms: false, privacy: false, data: false })
  const [loading, setLoading] = useState(false)

  const allAccepted = Object.values(accepted).every(Boolean)

  function toggle(key: string) {
    setAccepted(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleAccept() {
    if (!allAccepted) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('profiles').update({
        terms_accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_POLICY_VERSION,
        data_sharing_version: DATA_SHARING_VERSION,
      } as any).eq('id', user.id)

      router.replace('/(auth)/verify-address')
    } finally {
      setLoading(false)
    }
  }

  async function handleDecline() {
    Alert.alert(
      'Are you sure?',
      'You must accept all policies to use Voice of the People. Declining will sign you out and delete your account.',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Decline & Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase.from('profiles').delete().eq('id', user.id)
              await supabase.auth.admin.deleteUser(user.id).catch(() => {})
            }
            await supabase.auth.signOut()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Before You Continue</Text>
        <Text style={s.headerSub}>Please review and accept our policies to use Voice of the People.</Text>
      </View>

      <View style={s.notice}>
        <Text style={s.noticeText}>
          ⚠️ This platform displays <Text style={s.bold}>paid political advertisements</Text> from campaigns, PACs, and donors.
          All ads are clearly labeled with sponsor information per FEC disclosure requirements.
        </Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ gap: 12, padding: 16 }}>
        {DOCS.map(doc => (
          <TouchableOpacity
            key={doc.key}
            style={[s.docCard, accepted[doc.key] && s.docCardAccepted]}
            onPress={() => toggle(doc.key)}
            activeOpacity={0.8}
          >
            <View style={s.docCardLeft}>
              <View style={[s.checkbox, accepted[doc.key] && s.checkboxChecked]}>
                {accepted[doc.key] && <Text style={s.checkmark}>✓</Text>}
              </View>
            </View>
            <View style={s.docCardRight}>
              <Text style={s.docTitle}>{doc.title}</Text>
              <Text style={s.docSummary}>{doc.summary}</Text>
              <TouchableOpacity onPress={() => router.push(doc.route as any)}>
                <Text style={s.readLink}>Read full document →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={s.legalNote}>
          By tapping "I Accept All Policies" you confirm you are a Wisconsin resident aged 18 or older
          and agree to be bound by these policies. This acceptance is logged with a timestamp.
        </Text>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.acceptBtn, !allAccepted && s.acceptBtnDisabled]}
          onPress={handleAccept}
          disabled={!allAccepted || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.acceptBtnText}>
                {allAccepted ? '✓ I Accept All Policies' : `Accept All Policies (${Object.values(accepted).filter(Boolean).length}/3)`}
              </Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={s.declineBtn} onPress={handleDecline}>
          <Text style={s.declineBtnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080f' },
  header: { padding: 20, paddingTop: 48, borderBottomWidth: 1, borderColor: '#1a1a2a' },
  headerTitle: { color: '#e2e2ef', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  headerSub: { color: '#666', fontSize: 14, lineHeight: 20 },
  notice: {
    margin: 16, marginBottom: 0,
    backgroundColor: '#f59e0b12', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#f59e0b30',
  },
  noticeText: { color: '#d4a017', fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '700' },
  scroll: { flex: 1 },
  docCard: {
    backgroundColor: '#0d0d18', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#1a1a2a', flexDirection: 'row', gap: 14,
  },
  docCardAccepted: { borderColor: '#10b981', backgroundColor: '#10b98108' },
  docCardLeft: { paddingTop: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#333', alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#10b981', borderColor: '#10b981' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  docCardRight: { flex: 1, gap: 4 },
  docTitle: { color: '#e2e2ef', fontSize: 15, fontWeight: '700' },
  docSummary: { color: '#666', fontSize: 12, lineHeight: 17 },
  readLink: { color: '#4f7dff', fontSize: 12, fontWeight: '600', marginTop: 4 },
  legalNote: { color: '#444', fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 8 },
  footer: { padding: 16, gap: 10, borderTopWidth: 1, borderColor: '#1a1a2a' },
  acceptBtn: { backgroundColor: '#10b981', borderRadius: 10, padding: 16, alignItems: 'center' },
  acceptBtnDisabled: { backgroundColor: '#1a3a2a', opacity: 0.7 },
  acceptBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  declineBtn: { alignItems: 'center', padding: 12 },
  declineBtnText: { color: '#444', fontSize: 13 },
})
