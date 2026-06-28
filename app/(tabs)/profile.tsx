import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export default function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      setDisplayName(p?.display_name ?? '')
      setBio(p?.bio ?? '')
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ display_name: displayName, bio }).eq('id', profile.id)
    setProfile(prev => prev ? { ...prev, display_name: displayName, bio } : prev)
    setEditing(false)
    setSaving(false)
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut()
        router.replace('/(auth)/login')
      }},
    ])
  }

  if (loading) return <View style={[s.container, {justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color="#4f7dff" /></View>

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, gap: 14 }}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(profile?.display_name || profile?.full_name || '?')[0].toUpperCase()}</Text>
        </View>
        <View>
          {editing ? (
            <TextInput style={s.nameInput} value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#444" />
          ) : (
            <Text style={s.name}>{profile?.display_name || profile?.full_name || 'Unknown'}</Text>
          )}
          <Text style={s.role}>{profile?.role}</Text>
        </View>
      </View>

      <View style={s.badgeRow}>
        {profile?.verified_voter && <View style={s.greenBadge}><Text style={s.greenBadgeText}>✓ Verified Voter</Text></View>}
        {profile?.identity_verified && <View style={s.blueBadge}><Text style={s.blueBadgeText}>✓ ID Verified</Text></View>}
        {profile?.sub_status === 'active' && <View style={s.purpleBadge}><Text style={s.purpleBadgeText}>⚡ Pro</Text></View>}
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>Bio</Text>
        {editing ? (
          <TextInput
            style={s.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell voters about yourself…"
            placeholderTextColor="#444"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        ) : (
          <Text style={s.cardValue}>{profile?.bio || 'No bio yet.'}</Text>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>My Districts</Text>
        <Text style={s.cardValue}>{profile?.district_ids?.length ?? 0} districts linked</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/verify-address')}>
          <Text style={s.linkText}>Update address →</Text>
        </TouchableOpacity>
      </View>

      {profile?.role === 'candidate' && (
        <View style={s.card}>
          <Text style={s.cardLabel}>Candidate Info</Text>
          {[
            ['Party', profile.party ?? '—'],
            ['Campaign URL', profile.campaign_url ?? '—'],
            ['Subscription', profile.sub_status],
          ].map(([k, v]) => (
            <View key={k} style={s.infoRow}>
              <Text style={s.infoKey}>{k}</Text>
              <Text style={s.infoVal}>{v}</Text>
            </View>
          ))}
        </View>
      )}

      {editing ? (
        <View style={s.editActions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(false)}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
          <Text style={s.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080f' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4f7dff20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#4f7dff', fontSize: 24, fontWeight: '800' },
  name: { color: '#e2e2ef', fontSize: 20, fontWeight: '700' },
  nameInput: { color: '#e2e2ef', fontSize: 18, fontWeight: '700', borderBottomWidth: 1, borderColor: '#4f7dff', paddingBottom: 4, minWidth: 150 },
  role: { color: '#666', fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  greenBadge: { backgroundColor: '#10b98118', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  greenBadgeText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  blueBadge: { backgroundColor: '#3b82f618', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  blueBadgeText: { color: '#60a5fa', fontSize: 11, fontWeight: '700' },
  purpleBadge: { backgroundColor: '#8b5cf618', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  purpleBadgeText: { color: '#a78bfa', fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: '#0d0d18', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#1a1a2a', gap: 6 },
  cardLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cardValue: { color: '#e2e2ef', fontSize: 14, lineHeight: 20 },
  linkText: { color: '#4f7dff', fontSize: 13, fontWeight: '600', marginTop: 4 },
  bioInput: { color: '#e2e2ef', fontSize: 14, minHeight: 80, borderWidth: 1, borderColor: '#1e1e30', borderRadius: 6, padding: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoKey: { color: '#666', fontSize: 12 },
  infoVal: { color: '#e2e2ef', fontSize: 12 },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1a1a2a', alignItems: 'center' },
  cancelBtnText: { color: '#888', fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: '#4f7dff', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  editBtn: { backgroundColor: '#0d0d18', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a2a' },
  editBtnText: { color: '#e2e2ef', fontWeight: '600' },
  signOutBtn: { backgroundColor: '#ef444415', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef444430', marginTop: 8 },
  signOutText: { color: '#ef4444', fontWeight: '700' },
})
