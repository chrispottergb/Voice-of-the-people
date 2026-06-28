import { ScrollView, Text, StyleSheet, View } from 'react-native'
import { PRIVACY_POLICY, PRIVACY_POLICY_VERSION, PRIVACY_POLICY_DATE } from '@/legal/privacy-policy'

export default function PrivacyScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.versionBadge}>
        <Text style={s.versionText}>Version {PRIVACY_POLICY_VERSION} — Effective {PRIVACY_POLICY_DATE}</Text>
      </View>
      <Text style={s.body}>{PRIVACY_POLICY}</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080f' },
  content: { padding: 20, paddingBottom: 60 },
  versionBadge: { backgroundColor: '#1a1a2a', borderRadius: 6, padding: 8, marginBottom: 20, alignSelf: 'flex-start' },
  versionText: { color: '#666', fontSize: 11 },
  body: { color: '#c4c4d4', fontSize: 13, lineHeight: 22 },
})
