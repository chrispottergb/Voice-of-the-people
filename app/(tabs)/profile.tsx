import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSubStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#22c55e'
    case 'trialing':
      return '#3b82f6'
    case 'past_due':
      return '#f59e0b'
    case 'canceled':
    case 'unpaid':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

function getSubStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'trialing':
      return 'Trial'
    case 'past_due':
      return 'Past Due'
    case 'canceled':
      return 'Canceled'
    case 'unpaid':
      return 'Unpaid'
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'None'
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { profile, setProfile, signOut: storeSignOut } = useAuthStore()

  // Stats
  const [questionCount, setQuestionCount] = useState<number | null>(null)
  const [responseCount, setResponseCount] = useState<number | null>(null)
  const [officeName, setOfficeName] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Edit modal
  const [editVisible, setEditVisible] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState(profile?.display_name ?? '')
  const [editBio, setEditBio] = useState(profile?.bio ?? '')
  const [saving, setSaving] = useState(false)

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Sign out
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!profile) return
    fetchStats()
    if (profile.office_id) fetchOffice()
  }, [profile?.id])

  async function fetchStats() {
    if (!profile) return
    setStatsLoading(true)
    try {
      const promises: Promise<unknown>[] = []

      promises.push(
        supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('voter_id', profile.id)
          .then(({ count }) => setQuestionCount(count ?? 0))
      )

      if (profile.role === 'candidate') {
        promises.push(
          supabase
            .from('responses')
            .select('id', { count: 'exact', head: true })
            .eq('candidate_id', profile.id)
            .then(({ count }) => setResponseCount(count ?? 0))
        )
      }

      await Promise.all(promises)
    } catch (_) {
      // silently fail
    } finally {
      setStatsLoading(false)
    }
  }

  async function fetchOffice() {
    if (!profile?.office_id) return
    const { data } = await supabase
      .from('offices')
      .select('title')
      .eq('id', profile.office_id)
      .single()
    if (data) setOfficeName(data.title)
  }

  async function handleSaveEdit() {
    if (!profile) return
    setSaving(true)
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: editDisplayName.trim() || null, bio: editBio.trim() || null })
      .eq('id', profile.id)
      .select()
      .single()
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
      return
    }
    if (data) setProfile(data)
    setEditVisible(false)
  }

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload an avatar.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || !result.assets?.length || !profile) return

    const asset = result.assets[0]
    const ext = asset.uri.split('.').pop() ?? 'jpg'
    const fileName = `${profile.id}/avatar.${ext}`
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`

    setAvatarUploading(true)
    try {
      const response = await fetch(asset.uri)
      const blob = await response.blob()
      const arrayBuffer = await new Response(blob).arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, { contentType, upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const avatarUrl = urlData.publicUrl

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id)
        .select()
        .single()

      if (updateError) throw updateError
      if (updated) setProfile(updated)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      Alert.alert('Upload Error', msg)
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true)
          await supabase.auth.signOut()
          storeSignOut()
          setSigningOut(false)
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#818cf8" size="large" />
      </View>
    )
  }

  const isCandidate = profile.role === 'candidate'
  const districtCount = profile.district_ids?.length ?? (profile.district_id ? 1 : 0)
  const initials = (profile.display_name ?? profile.full_name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handlePickAvatar} disabled={avatarUploading} style={styles.avatarWrapper}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          {avatarUploading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <View style={styles.avatarUploadBadge}>
              <Text style={styles.avatarUploadIcon}>+</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Name & Role */}
      <View style={styles.nameSection}>
        <Text style={styles.displayName}>{profile.display_name ?? 'No display name'}</Text>
        {profile.full_name ? <Text style={styles.fullName}>{profile.full_name}</Text> : null}

        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.roleBadge]}>
            <Text style={styles.badgeText}>{isCandidate ? 'Candidate' : 'Voter'}</Text>
          </View>

          {profile.verified_voter && (
            <View style={[styles.badge, styles.verifiedBadge]}>
              <Text style={styles.badgeText}>Verified Voter</Text>
            </View>
          )}

          {districtCount > 0 && (
            <View style={[styles.badge, styles.districtBadge]}>
              <Text style={styles.badgeText}>{districtCount} District{districtCount !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bio */}
      {profile.bio ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bio</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      ) : null}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {statsLoading ? '...' : (questionCount ?? 0)}
          </Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>

        {isCandidate && (
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {statsLoading ? '...' : (responseCount ?? 0)}
            </Text>
            <Text style={styles.statLabel}>Responses</Text>
          </View>
        )}

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{districtCount}</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
      </View>

      {/* Districts summary */}
      {districtCount > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>My Districts</Text>
          <Text style={styles.cardValue}>
            {districtCount} district{districtCount !== 1 ? 's' : ''} registered
          </Text>
        </View>
      )}

      {/* Candidate-only info */}
      {isCandidate && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Candidate Info</Text>

          {officeName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Office</Text>
              <Text style={styles.infoValue}>{officeName}</Text>
            </View>
          )}

          {profile.party && (
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Party</Text>
              <Text style={styles.infoValue}>{profile.party}</Text>
            </View>
          )}

          {profile.campaign_url && (
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Campaign URL</Text>
              <Text style={[styles.infoValue, styles.linkText]} numberOfLines={1}>
                {profile.campaign_url}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Identity</Text>
            <View style={[styles.badge, profile.identity_verified ? styles.verifiedBadge : styles.pendingBadge]}>
              <Text style={styles.badgeText}>
                {profile.identity_verified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Subscription</Text>
            <View style={[styles.badge, { backgroundColor: getSubStatusColor(profile.sub_status) + '33' }]}>
              <Text style={[styles.badgeText, { color: getSubStatusColor(profile.sub_status) }]}>
                {getSubStatusLabel(profile.sub_status)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setEditDisplayName(profile.display_name ?? '')
          setEditBio(profile.bio ?? '')
          setEditVisible(true)
        }}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} disabled={signingOut}>
        {signingOut ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signOutText}>Sign Out</Text>
        )}
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              placeholder="Display name"
              placeholderTextColor="#6b7280"
              maxLength={50}
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.bioInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell people about yourself..."
              placeholderTextColor="#6b7280"
              multiline
              maxLength={300}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const PURPLE = '#818cf8'
const CARD_BG = '#1e1e2e'
const BORDER = '#2a2a3d'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: PURPLE,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2a2a3d',
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: PURPLE,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUploadBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f0f1a',
  },
  avatarUploadIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },

  // Name
  nameSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
  },
  displayName: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  fullName: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },

  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  roleBadge: {
    backgroundColor: '#4f46e5',
  },
  verifiedBadge: {
    backgroundColor: '#16a34a',
  },
  districtBadge: {
    backgroundColor: '#0e7490',
  },
  pendingBadge: {
    backgroundColor: '#78350f',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statNumber: {
    color: PURPLE,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cards
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
    gap: 10,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardValue: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  bioText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoKey: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 13,
    flex: 2,
    textAlign: 'right',
  },
  linkText: {
    color: PURPLE,
  },

  // Buttons
  editButton: {
    backgroundColor: '#2a2a3d',
    borderWidth: 1,
    borderColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: PURPLE,
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fca5a5',
    fontSize: 15,
    fontWeight: '700',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 6,
  },
  modalTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0f0f1a',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    color: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  bioInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a2a3d',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
