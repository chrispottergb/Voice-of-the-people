import { Stack } from 'expo-router'

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0d0d18' },
        headerTintColor: '#e2e2ef',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#08080f' },
      }}
    >
      <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="data-sharing" options={{ title: 'Data Sharing Policy' }} />
    </Stack>
  )
}
