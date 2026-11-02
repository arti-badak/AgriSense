import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { downloadCsv, toCsv } from '../lib/csv'

export default function Reports() {
  const { farms, readings, recommendations, loadDemoData, showToast } = useApp()
  const [busy, setBusy] = useState(false)

  const cropCounts = useMemo(() => {
    const map = new Map()
    readings.forEach((item) => {
      map.set(item.cropType, (map.get(item.cropType) ?? 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [readings])

  const moistureAvg =
    readings.length === 0
      ? 0
      : readings.reduce((sum, item) => sum + Number(item.moisture), 0) / readings.length
  const pHAvg =
    readings.length === 0 ? 0 : readings.reduce((sum, item) => sum + Number(item.pH), 0) / readings.length
  const tempAvg =
    readings.length === 0
      ? 0
      : readings.reduce((sum, item) => sum + Number(item.temperature), 0) / readings.length

  function exportReadings() {
    if (readings.length === 0) {
      showToast('error', 'No readings available to export.')
      return
    }
    setBusy(true)
    const csv = toCsv(readings, [
      { key: 'createdAt', label: 'recorded_at' },
      { key: 'farmName', label: 'farm_name' },
      { key: 'cropType', label: 'crop_type' },
      { key: 'moisture', label: 'soil_moisture_pct' },
      { key: 'pH', label: 'soil_ph' },
      { key: 'temperature', label: 'soil_temperature_c' },
      { key: 'isDemo', label: 'sample_record' },
    ])
    const stamped = `demonstration_data,true\nnote,AgriSense demonstration export — not field-validated\n\n${csv}`
    downloadCsv(`agrisense-readings-${new Date().toISOString().slice(0, 10)}.csv`, stamped)
    setBusy(false)
    showToast('success', 'CSV download started. File is labelled as demonstration data.')
  }

  function exportRecommendations() {
    if (recommendations.length === 0) {
      showToast('error', 'No recommendations available to export.')
      return
    }
    const rows = recommendations.map((item) => ({
      createdAt: item.createdAt,
      farmName: item.farmName,
      cropType: item.cropType,
      moisture: item.moisture,
      pH: item.pH,
      temperature: item.temperature,
      action: item.result.irrigationAction,
      urgency: item.result.urgency,
      reason: item.result.reasons.join(' | '),
      disclaimer: item.result.disclaimer,
      isDemo: item.isDemo,
    }))
    const csv = toCsv(rows, [
      { key: 'createdAt', label: 'generated_at' },
      { key: 'farmName', label: 'farm_name' },
      { key: 'cropType', label: 'crop_type' },
      { key: 'moisture', label: 'soil_moisture_pct' },
      { key: 'pH', label: 'soil_ph' },
      { key: 'temperature', label: 'soil_temperature_c' },
      { key: 'action', label: 'irrigation_action' },
      { key: 'urgency', label: 'urgency' },
      { key: 'reason', label: 'reasoning' },
      { key: 'disclaimer', label: 'disclaimer' },
      { key: 'isDemo', label: 'sample_record' },
    ])
    downloadCsv(`agrisense-recommendations-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('success', 'Recommendation CSV downloaded.')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        All report figures are demonstration data stored in localStorage. Exported files include this labelling.
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-100 bg-white p-4">
          <p className="text-sm text-slate-500">Farms in report</p>
          <p className="mt-1 text-2xl font-semibold">{farms.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-100 bg-white p-4">
          <p className="text-sm text-slate-500">Average moisture</p>
          <p className="mt-1 text-2xl font-semibold">{readings.length ? `${moistureAvg.toFixed(1)}%` : '—'}</p>
        </article>
        <article className="rounded-2xl border border-emerald-100 bg-white p-4">
          <p className="text-sm text-slate-500">Average pH</p>
          <p className="mt-1 text-2xl font-semibold">{readings.length ? pHAvg.toFixed(2) : '—'}</p>
        </article>
        <article className="rounded-2xl border border-emerald-100 bg-white p-4">
          <p className="text-sm text-slate-500">Average temperature</p>
          <p className="mt-1 text-2xl font-semibold">{readings.length ? `${tempAvg.toFixed(1)}°C` : '—'}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Readings summary</h2>
        {readings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={FileText}
              title="Nothing to summarize"
              description="Load demo data or add readings to generate a report."
              action={
                <button
                  type="button"
                  onClick={loadDemoData}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Load Demo Data
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Readings by crop</h3>
              <ul className="mt-3 space-y-2">
                {cropCounts.map(([crop, count]) => (
                  <li key={crop} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm">
                    <span>{crop}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recommendation activity</h3>
              <p className="mt-3 text-sm text-slate-600">
                {recommendations.length} rule-based recommendation{recommendations.length === 1 ? '' : 's'} stored.
                High-urgency count:{' '}
                {recommendations.filter((item) => item.result.urgency === 'high').length}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportReadings}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Download readings CSV
                </button>
                <button
                  type="button"
                  onClick={exportRecommendations}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4" />
                  Download recommendations CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
