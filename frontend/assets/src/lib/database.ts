import { supabase } from '../composables/auth'

export type DatabaseRow = Record<string, any>

export async function fetchRows(table: string): Promise<{ data: DatabaseRow[]; error: string | null }> {
  if (!supabase) {
    return { data: [], error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.from(table).select('*')
  return {
    data: (data ?? []) as DatabaseRow[],
    error: error?.message ?? null,
  }
}

export function displayDate(value: unknown): string {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function relativeDate(value: unknown): string {
  if (!value) return '—'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}
