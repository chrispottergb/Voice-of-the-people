import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { resolveWisconsinDistricts } from '@/lib/district-resolver';

interface District {
  id: string;
  name: string;
  type?: string;
}

interface DistrictResults {
  congressional?: District | null;
  state_senate?: District | null;
  state_assembly?: District | null;
  county?: District | null;
  municipal?: District | null;
  all_district_ids?: string[];
}

export default function VerifyAddressScreen() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DistrictResults | null>(null);

  async function handleFindDistricts() {
    if (!address.trim()) {
      setError('Please enter a street address.');
      return;
    }

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const districts = await resolveWisconsinDistricts(address.trim(), supabase);
      setResults(districts);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to resolve districts. Please check your address and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!results) return;

    setConfirming(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('Not authenticated.');

      const districtIds: string[] =
        results.all_district_ids ??
        ([
          results.congressional?.id,
          results.state_senate?.id,
          results.state_assembly?.id,
          results.county?.id,
          results.municipal?.id,
        ].filter(Boolean) as string[]);

      const primaryDistrictId =
        results.county?.id ??
        results.municipal?.id ??
        results.congressional?.id ??
        results.state_senate?.id ??
        results.state_assembly?.id ??
        null;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          district_ids: districtIds,
          district_id: primaryDistrictId,
          address: address.trim(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save your district information. Please try again.');
    } finally {
      setConfirming(false);
    }
  }

  const districtCards: Array<{
    key: keyof Omit<DistrictResults, 'all_district_ids'>;
    label: string;
    cardStyle: object;
    labelStyle: object;
  }> = [
    {
      key: 'congressional',
      label: 'Congressional District',
      cardStyle: styles.cardBlue,
      labelStyle: styles.labelBlue,
    },
    {
      key: 'state_senate',
      label: 'State Senate District',
      cardStyle: styles.cardGreen,
      labelStyle: styles.labelGreen,
    },
    {
      key: 'state_assembly',
      label: 'State Assembly District',
      cardStyle: styles.cardPurple,
      labelStyle: styles.labelPurple,
    },
    {
      key: 'county',
      label: 'County',
      cardStyle: styles.cardOrange,
      labelStyle: styles.labelOrange,
    },
    {
      key: 'municipal',
      label: 'Municipality',
      cardStyle: styles.cardTeal,
      labelStyle: styles.labelTeal,
    },
  ];

  const hasResults =
    results &&
    districtCards.some(({ key }) => results[key] != null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Find Your Districts</Text>
            <Text style={styles.subtitle}>
              Enter your Wisconsin address to find your voting districts
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="123 Main St, Milwaukee, WI 53202"
            placeholderTextColor="#6b7280"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleFindDistricts}
            editable={!loading && !confirming}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.findButton, (loading || confirming) && styles.buttonDisabled]}
            onPress={handleFindDistricts}
            disabled={loading || confirming}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Find My Districts</Text>
            )}
          </TouchableOpacity>

          {hasResults ? (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsHeading}>Your Voting Districts</Text>

              {districtCards.map(({ key, label, cardStyle, labelStyle }) => {
                const district = results![key];
                if (!district) return null;
                return (
                  <View key={key} style={[styles.card, cardStyle]}>
                    <Text style={[styles.cardTypeLabel, labelStyle]}>{label}</Text>
                    <Text style={styles.cardName}>{district.name}</Text>
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.confirmButton, confirming && styles.buttonDisabled]}
                onPress={handleConfirm}
                disabled={confirming}
                activeOpacity={0.8}
              >
                {confirming ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Confirm & Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f1f5f9',
    marginBottom: 14,
  },
  errorContainer: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 20,
  },
  findButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resultsSection: {
    marginTop: 32,
  },
  resultsHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 14,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  // Blue — Congressional
  cardBlue: {
    backgroundColor: '#172554',
    borderColor: '#1d4ed8',
  },
  labelBlue: {
    color: '#93c5fd',
  },
  // Green — State Senate
  cardGreen: {
    backgroundColor: '#052e16',
    borderColor: '#16a34a',
  },
  labelGreen: {
    color: '#86efac',
  },
  // Purple — State Assembly
  cardPurple: {
    backgroundColor: '#2e1065',
    borderColor: '#7c3aed',
  },
  labelPurple: {
    color: '#c4b5fd',
  },
  // Orange — County
  cardOrange: {
    backgroundColor: '#431407',
    borderColor: '#ea580c',
  },
  labelOrange: {
    color: '#fdba74',
  },
  // Teal — Municipality
  cardTeal: {
    backgroundColor: '#042f2e',
    borderColor: '#0d9488',
  },
  labelTeal: {
    color: '#5eead4',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 50,
  },
});
