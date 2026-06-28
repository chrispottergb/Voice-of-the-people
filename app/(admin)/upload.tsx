import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Platform,
} from 'react-native'
import { router } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { supabase } from '@/lib/supabase'

const C = {
  bg: '#08080f',
  surface: '#0d0d18',
  border: '#1a1a2a',
  text: '#e2e2ef',
  dim: '#666',
  accent: '#6366f1',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
}

interface VoterRow {
  full_name: string
  email: string
  address: string
  district_id?: string
}

interface RowResult {
  row: number
  name: string
  status: 'success' | 'skip' | 'error'
  message: string
}

function parseCSV(text: string): VoterRow[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const rows: VoterRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? '' })
    if (row.email || row.full_name) {
      rows.push({
        full_name: row.full_name || row.name || '',
        email: row.email || '',
        address: row.address || row.street_address || '',
        district_id: row.district_id || undefined,
      })
    }
  }
  return rows
}

async function readFileText(uri: string, mimeType: string): Promise<string> {
  const res = await fetch(uri)
  if (mimeType === 'text/csv' || mimeType === 'text/plain' || uri.endsWith('.csv')) {
    return res.text()
  }
  // For PDF: return placeholder — real PDF parsing requires a native module
  throw new Error('PDF parsing requires server-side processing. Please upload a CSV file for bulk import, or use the Supabase dashboard for PDF voter forms.')
}

export default function UploadScreen() {
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; uri: string } | null>(null)
  const [rows, setRows] = useState<VoterRow[]>([])
  const [results, setResults] = useState<RowResult[]>([])
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<'pick' | 'preview' | 'done'>('pick')
  const [progress, setProgress] = useState(0)

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/plain', 'application/pdf', '*/*'],
      copyToCacheDirectory: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    setFileInfo({ name: asset.name, type: asset.mimeType ?? '', uri: asset.uri })

    try {
      const text = await readFileText(asset.uri, asset.mimeType ?? '')
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        Alert.alert('No Data', 'No valid rows found. Ensure CSV has columns: full_name, email, address')
        return
      }
      setRows(parsed)
      setStage('preview')
    } catch (err) {
      Alert.alert('File Error', String(err))
    }
  }

  async function runImport() {
    setLoading(true)
    setProgress(0)
    const res: RowResult[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      setProgress(Math.round(((i + 1) / rows.length) * 100))

      if (!row.email) {
        res.push({ row: i + 1, name: row.full_name, status: 'skip', message: 'Missing email' })
        continue
      }

      // Create auth user via admin API (service role) then upsert profile
      const { data: created, error: authErr } = await supabase.auth.admin.createUser({
        email: row.email,
        email_confirm: true,
        user_metadata: { full_name: row.full_name },
      })

      if (authErr) {
        // User may already exist — try to find them
        if (authErr.message.includes('already been registered') || authErr.message.includes('already exists')) {
          res.push({ row: i + 1, name: row.full_name, status: 'skip', message: 'Already registered' })
        } else {
          res.push({ row: i + 1, name: row.full_name, status: 'error', message: authErr.message })
        }
        continue
      }

      const userId = created.user?.id
      if (!userId) {
        res.push({ row: i + 1, name: row.full_name, status: 'error', message: 'No user ID returned' })
        continue
      }

      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: row.full_name,
        role: 'voter',
        verified_voter: true,
        district_id: row.district_id ?? null,
      }, { onConflict: 'id' })

      if (profileErr) {
        res.push({ row: i + 1, name: row.full_name, status: 'error', message: profileErr.message })
      } else {
        res.push({ row: i + 1, name: row.full_name, status: 'success', message: 'Imported' })
      }
    }

    setResults(res)
    setStage('done')
    setLoading(false)
  }

  const successCount = results.filter(r => r.status === 'success').length
  const skipCount = results.filter(r => r.status === 'skip').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.title}>Upload Voter Registration</Text>
      </View>

      <ScrollView style={s.scroll}>
        {/* Format info */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Supported Formats</Text>
          <View style={s.formatRow}>
            <View style={[s.formatBadge, { borderColor: C.green }]}>
              <Text style={[s.formatText, { color: C.green }]}>✅ CSV</Text>
            </View>
            <View style={[s.formatBadge, { borderColor: C.yellow }]}>
              <Text style={[s.formatText, { color: C.yellow }]}>⚠️ PDF (manual)</Text>
            </View>
          </View>
          <Text style={s.infoNote}>
            CSV columns: <Text style={s.mono}>full_name, email, address, district_id</Text>
            {'\n'}PDF voter registration forms require manual entry in Supabase dashboard.
          </Text>
        </View>

        {stage === 'pick' && (
          <TouchableOpacity style={s.dropZone} onPress={pickFile} activeOpacity={0.8}>
            <Text style={s.dropIcon}>📂</Text>
            <Text style={s.dropTitle}>Select File</Text>
            <Text style={s.dropSub}>CSV or PDF voter registration export</Text>
          </TouchableOpacity>
        )}

        {stage === 'preview' && (
          <View>
            <View style={s.fileCard}>
              <Text style={s.fileIcon}>📄</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.fileName}>{fileInfo?.name}</Text>
                <Text style={s.fileCount}>{rows.length} voter records found</Text>
              </View>
              <TouchableOpacity onPress={() => { setStage('pick'); setRows([]) }}>
                <Text style={s.removeFile}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Preview table */}
            <Text style={s.previewLabel}>Preview (first 5 rows)</Text>
            <View style={s.previewTable}>
              {rows.slice(0, 5).map((r, i) => (
                <View key={i} style={[s.previewRow, i % 2 === 0 && s.previewRowAlt]}>
                  <Text style={s.previewCell} numberOfLines={1}>{r.full_name || '—'}</Text>
                  <Text style={[s.previewCell, s.previewEmail]} numberOfLines={1}>{r.email}</Text>
                </View>
              ))}
            </View>
            {rows.length > 5 && (
              <Text style={s.moreRows}>+{rows.length - 5} more rows</Text>
            )}

            <TouchableOpacity
              style={[s.importBtn, loading && s.importBtnDisabled]}
              onPress={runImport}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={s.importBtnText}>Importing… {progress}%</Text>
                </View>
              ) : (
                <Text style={s.importBtnText}>Import {rows.length} Voters</Text>
              )}
            </TouchableOpacity>

            {loading && (
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${progress}%` as any }]} />
              </View>
            )}
          </View>
        )}

        {stage === 'done' && (
          <View>
            {/* Summary */}
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Import Complete</Text>
              <View style={s.summaryRow}>
                <View style={s.summaryItem}>
                  <Text style={[s.summaryNum, { color: C.green }]}>{successCount}</Text>
                  <Text style={s.summaryLabel}>Imported</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={[s.summaryNum, { color: C.yellow }]}>{skipCount}</Text>
                  <Text style={s.summaryLabel}>Skipped</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={[s.summaryNum, { color: C.red }]}>{errorCount}</Text>
                  <Text style={s.summaryLabel}>Errors</Text>
                </View>
              </View>
            </View>

            {/* Per-row results */}
            <Text style={s.previewLabel}>Row Results</Text>
            <View style={s.previewTable}>
              {results.map((r, i) => (
                <View key={i} style={[s.previewRow, i % 2 === 0 && s.previewRowAlt]}>
                  <Text style={s.previewCell} numberOfLines={1}>{r.name || `Row ${r.row}`}</Text>
                  <View style={[s.resultBadge, {
                    backgroundColor: r.status === 'success' ? '#10b98118' : r.status === 'skip' ? '#f59e0b18' : '#ef444418',
                  }]}>
                    <Text style={{
                      fontSize: 11, fontWeight: '600',
                      color: r.status === 'success' ? C.green : r.status === 'skip' ? C.yellow : C.red,
                    }}>
                      {r.status === 'success' ? '✓' : r.status === 'skip' ? '↷' : '✕'} {r.message}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
              <Text style={s.doneBtnText}>← Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderBottomWidth: 1, borderColor: C.border, backgroundColor: C.surface,
  },
  backBtn: { padding: 4 },
  backText: { color: C.dim, fontSize: 18 },
  title: { color: C.text, fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1, padding: 16 },

  infoCard: {
    backgroundColor: C.surface, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  infoTitle: { color: C.text, fontWeight: '700', fontSize: 13, marginBottom: 10 },
  formatRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  formatBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  formatText: { fontSize: 12, fontWeight: '600' },
  infoNote: { color: C.dim, fontSize: 12, lineHeight: 18 },
  mono: { fontFamily: 'monospace', color: '#818cf8' },

  dropZone: {
    backgroundColor: C.surface, borderRadius: 12, borderWidth: 2,
    borderColor: C.border, borderStyle: 'dashed', padding: 40,
    alignItems: 'center', marginBottom: 16,
  },
  dropIcon: { fontSize: 36, marginBottom: 12 },
  dropTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  dropSub: { color: C.dim, fontSize: 13 },

  fileCard: {
    backgroundColor: C.surface, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: C.border, flexDirection: 'row',
    alignItems: 'center', gap: 12, marginBottom: 16,
  },
  fileIcon: { fontSize: 28 },
  fileName: { color: C.text, fontWeight: '600', fontSize: 14 },
  fileCount: { color: C.dim, fontSize: 12, marginTop: 2 },
  removeFile: { color: C.dim, fontSize: 18, padding: 4 },

  previewLabel: { color: C.dim, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  previewTable: {
    backgroundColor: C.surface, borderRadius: 8, borderWidth: 1,
    borderColor: C.border, overflow: 'hidden', marginBottom: 8,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  previewRowAlt: { backgroundColor: '#0a0a14' },
  previewCell: { flex: 1, color: C.text, fontSize: 12 },
  previewEmail: { color: C.dim },
  moreRows: { color: C.dim, fontSize: 12, textAlign: 'center', marginBottom: 16 },

  resultBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },

  importBtn: {
    backgroundColor: C.accent, borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 8,
  },
  importBtnDisabled: { opacity: 0.7 },
  importBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  progressBar: {
    height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 12, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: C.accent, borderRadius: 2 },

  summaryCard: {
    backgroundColor: C.surface, borderRadius: 10, padding: 20,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  summaryTitle: { color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 16, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '800' },
  summaryLabel: { color: C.dim, fontSize: 12, marginTop: 2 },

  doneBtn: {
    backgroundColor: C.surface, borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: C.border,
  },
  doneBtnText: { color: C.text, fontWeight: '600', fontSize: 14 },
})
