import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setError(null)
    if (!email || !password) { setError('Email and password required.'); return }
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }
      router.replace('/(tabs)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <Text style={s.emoji}>🗳️</Text>
          <Text style={s.title}>Voice of the People</Text>
          <Text style={s.subtitle}>Wisconsin Civic Engagement Platform</Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#444"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
          />

          {error && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={s.link}>
            <Text style={s.linkText}>Don't have an account? <Text style={s.linkBold}>Register</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(admin)/login')} style={s.adminLink}>
            <Text style={s.adminLinkText}>Admin access →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#555', fontSize: 13, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: '#111118', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#1e1e2e',
  },
  label: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#0d0d16', borderWidth: 1, borderColor: '#1e1e30',
    borderRadius: 8, padding: 12, color: '#fff', fontSize: 15, marginBottom: 16,
  },
  error: { color: '#f87171', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: '#4f7dff', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#666', fontSize: 13 },
  linkBold: { color: '#4f7dff', fontWeight: '600' },
  adminLink: { alignItems: 'center', marginTop: 8 },
  adminLinkText: { color: '#333', fontSize: 12 },
})
