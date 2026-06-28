import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setError(null)
    if (!email || !password) { setError('Email and password required.'); return }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        setError('Access denied. Admin accounts only.')
        return
      }

      router.replace('/(admin)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.card}>
        <View style={s.badge}>
          <Text style={s.badgeText}>ADMIN</Text>
        </View>
        <Text style={s.title}>Voice of the People</Text>
        <Text style={s.subtitle}>Administration Console</Text>

        <View style={s.divider} />

        <Text style={s.label}>Email Address</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="admin@votp.gov"
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
          placeholder="••••••••••••"
          placeholderTextColor="#444"
          secureTextEntry
        />

        {error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Sign In to Admin</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={s.backLink}>
          <Text style={s.backLinkText}>← Back to voter login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111118',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e1030',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6366f133',
  },
  badgeText: { color: '#818cf8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#555', fontSize: 13, marginBottom: 24 },
  divider: { height: 1, backgroundColor: '#1a1a2a', marginBottom: 24 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#0d0d16',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  error: { color: '#f87171', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  btn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backLink: { alignItems: 'center', marginTop: 20 },
  backLinkText: { color: '#444', fontSize: 13 },
})
