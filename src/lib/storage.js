const STORAGE_KEY = 'agrisense.v1'
const SCHEMA_VERSION = 1

const emptyState = () => ({
  schemaVersion: SCHEMA_VERSION,
  farms: [],
  readings: [],
  recommendations: [],
})

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) return emptyState()
    return {
      schemaVersion: SCHEMA_VERSION,
      farms: Array.isArray(parsed.farms) ? parsed.farms : [],
      readings: Array.isArray(parsed.readings) ? parsed.readings : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state) {
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    farms: state.farms ?? [],
    readings: state.readings ?? [],
    recommendations: state.recommendations ?? [],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
