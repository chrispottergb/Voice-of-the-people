import { ScrollView, Text, StyleSheet, View } from 'react-native'
import { TERMS_OF_SERVICE, TERMS_VERSION, TERMS_DATE } from '@/legal/terms-of-service'

export default function TermsScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.versionBadge}>
        <Text style={s.versionText}>Version {TERMS_VERSION} — Effective {TERMS_DATE}</Text>
      </View>
      <Text style={s.body}>{TERMS_OF_SERVICE}</Text>
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
