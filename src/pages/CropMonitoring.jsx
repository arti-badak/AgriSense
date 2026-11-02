import { useMemo, useState } from 'react'
import { Droplets, Leaf } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { CROP_TYPES } from '../lib/recommendationEngine'

const emptyForm = {
  farmId: '',
  cropType: 'Tomato',
  moisture: '',
  pH: '',
  temperature: '',
}

export default function CropMonitoring() {
  const { farms, readings, addReading, deleteReading, loadDemoData, showToast } = useApp()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const chartData = useMemo(
    () =>
      [...readings]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-16)
        .map((item) => ({
          label: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          moisture: item.moisture,
          pH: item.pH,
          temperature: item.temperature,
        })),
    [readings],
  )

  function validate() {
    const next = {}
    if (!form.farmId) next.farmId = 'Select a farm.'
    if (!form.cropType) next.cropType = 'Select a crop type.'
    const moisture = Number(form.moisture)
    const pH = Number(form.pH)
    const temperature = Number(form.temperature)
    if (form.moisture === '' || Number.isNaN(moisture) || moisture < 0 || moisture > 100) {
      next.moisture = 'Moisture must be 0–100%.'
    }
    if (form.pH === '' || Number.isNaN(pH) || pH < 0 || pH > 14) {
      next.pH = 'pH must be 0–14.'
    }
    if (form.temperature === '' || Number.isNaN(temperature) || temperature < -10 || temperature > 60) {
      next.temperature = 'Temperature must be -10°C to 60°C.'
    }
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast('error', 'Please correct the reading form before saving.')
      return
    }
    const farm = farms.find((item) => item.id === form.farmId)
    addReading({
      farmId: farm.id,
      farmName: farm.name,
      cropType: form.cropType,
      moisture: Number(form.moisture),
      pH: Number(form.pH),
      temperature: Number(form.temperature),
    })
    setForm({ ...emptyForm, farmId: form.farmId, cropType: form.cropType })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Entered values are stored locally for demonstration. They are not live sensor feeds.
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Add a crop reading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm font-medium text-slate-700">
            Farm
            <select
              value={form.farmId}
              onChange={(e) => setForm((prev) => ({ ...prev, farmId: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            >
              <option value="">Select farm</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
            {errors.farmId ? <span className="text-xs text-red-600">{errors.farmId}</span> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Crop type
            <select
              value={form.cropType}
              onChange={(e) => setForm((prev) => ({ ...prev, cropType: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            >
              {CROP_TYPES.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Soil moisture (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.moisture}
              onChange={(e) => setForm((prev) => ({ ...prev, moisture: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
            {errors.moisture ? <span className="text-xs text-red-600">{errors.moisture}</span> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Soil pH
            <input
              type="number"
              min="0"
              max="14"
              step="0.1"
              value={form.pH}
              onChange={(e) => setForm((prev) => ({ ...prev, pH: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
            {errors.pH ? <span className="text-xs text-red-600">{errors.pH}</span> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Soil temperature (°C)
            <input
              type="number"
              min="-10"
              max="60"
              step="0.1"
              value={form.temperature}
              onChange={(e) => setForm((prev) => ({ ...prev, temperature: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
            {errors.temperature ? <span className="text-xs text-red-600">{errors.temperature}</span> : null}
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Save reading
        </button>
        {farms.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No farms available.{' '}
            <button type="button" className="font-semibold text-emerald-700" onClick={loadDemoData}>
              Load Demo Data
            </button>{' '}
            or add a farm first.
          </p>
        ) : null}
      </form>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Moisture, pH and temperature</h2>
        {chartData.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Droplets}
              title="No readings to chart"
              description="Save a reading or load sample data to see moisture, pH, and temperature together."
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
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="moisture" name="Moisture %" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="pH" name="pH" stroke="#d97706" strokeWidth={2} />
                <Line type="monotone" dataKey="temperature" name="Temp °C" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Stored readings</h2>
        {readings.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={Leaf} title="History is empty" description="Saved readings will appear in this table." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-emerald-100 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">When</th>
                  <th className="py-2 pr-3 font-medium">Farm</th>
                  <th className="py-2 pr-3 font-medium">Crop</th>
                  <th className="py-2 pr-3 font-medium">Moisture</th>
                  <th className="py-2 pr-3 font-medium">pH</th>
                  <th className="py-2 pr-3 font-medium">Temp</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3 text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-3 font-medium text-slate-900">{item.farmName}</td>
                    <td className="py-3 pr-3">{item.cropType}</td>
                    <td className="py-3 pr-3">{item.moisture}%</td>
                    <td className="py-3 pr-3">{item.pH}</td>
                    <td className="py-3 pr-3">{item.temperature}°C</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => deleteReading(item.id)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
