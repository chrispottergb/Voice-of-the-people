import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function AdminLayout() {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function guardAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/(auth)/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.replace('/(tabs)')
        return
      }
      setChecking(false)
    }
    guardAdmin()
  }, [])

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
      <Stack.Screen name="user-detail" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
