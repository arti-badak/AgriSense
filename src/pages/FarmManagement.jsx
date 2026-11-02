import { useState } from 'react'
import { Plus, Tractor } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useApp } from '../context/AppContext'
import { CROP_TYPES } from '../lib/recommendationEngine'

const emptyForm = {
  name: '',
  location: '',
  areaHectares: '',
  primaryCrop: 'Tomato',
  notes: '',
}

export default function FarmManagement() {
  const { farms, addFarm, updateFarm, deleteFarm, loadDemoData, showToast } = useApp()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  function validate(values) {
    const next = {}
    if (!values.name.trim()) next.name = 'Farm name is required.'
    if (!values.location.trim()) next.location = 'Location is required.'
    const area = Number(values.areaHectares)
    if (values.areaHectares === '' || Number.isNaN(area) || area <= 0) {
      next.areaHectares = 'Enter a positive area in hectares.'
    }
    if (!values.primaryCrop) next.primaryCrop = 'Select a primary crop.'
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast('error', 'Please correct the highlighted farm fields.')
      return
    }
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      areaHectares: Number(form.areaHectares),
      primaryCrop: form.primaryCrop,
      notes: form.notes.trim(),
    }
    if (editing) {
      updateFarm(editing.id, payload)
      setEditing(null)
    } else {
      addFarm(payload)
    }
    setForm(emptyForm)
  }

  function startEdit(farm) {
    setEditing(farm)
    setForm({
      name: farm.name,
      location: farm.location,
      areaHectares: String(farm.areaHectares),
      primaryCrop: farm.primaryCrop,
      notes: farm.notes ?? '',
    })
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {editing ? 'Edit farm details' : 'Add a farm'}
            </h2>
            <p className="text-sm text-slate-500">Records stay in this browser for the demonstration.</p>
          </div>
          <Plus className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Farm name
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
              placeholder="e.g. Riverside Plot A"
            />
            {errors.name ? <span className="text-xs text-red-600">{errors.name}</span> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
              placeholder="Village / district"
            />
            {errors.location ? <span className="text-xs text-red-600">{errors.location}</span> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Area (hectares)
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={form.areaHectares}
              onChange={(e) => setForm((prev) => ({ ...prev, areaHectares: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
            {errors.areaHectares ? <span className="text-xs text-red-600">{errors.areaHectares}</span> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Primary crop
            <select
              value={form.primaryCrop}
              onChange={(e) => setForm((prev) => ({ ...prev, primaryCrop: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            >
              {CROP_TYPES.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
              placeholder="Optional notes"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {editing ? 'Save changes' : 'Add farm'}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setForm(emptyForm)
                setErrors({})
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">View farms</h2>
        {farms.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Tractor}
              title="No farms yet"
              description="Add a farm above or load the marked sample farm for an immediate demo."
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
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-emerald-100 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Location</th>
                  <th className="py-2 pr-3 font-medium">Area</th>
                  <th className="py-2 pr-3 font-medium">Crop</th>
                  <th className="py-2 pr-3 font-medium">Notes</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((farm) => (
                  <tr key={farm.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-3 font-medium text-slate-900">
                      {farm.name}
                      {farm.isDemo ? (
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Sample
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{farm.location}</td>
                    <td className="py-3 pr-3 text-slate-600">{farm.areaHectares} ha</td>
                    <td className="py-3 pr-3 text-slate-600">{farm.primaryCrop}</td>
                    <td className="py-3 pr-3 text-slate-600">{farm.notes || '—'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(farm)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(farm)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this farm?"
        onClose={() => setPendingDelete(null)}
      >
        <p className="text-sm text-slate-600">
          {pendingDelete
            ? `This removes ${pendingDelete.name} and any readings or recommendations linked to it from this browser.`
            : null}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              deleteFarm(pendingDelete.id)
              if (editing?.id === pendingDelete.id) {
                setEditing(null)
                setForm(emptyForm)
              }
              setPendingDelete(null)
            }}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete farm
          </button>
        </div>
      </Modal>
    </div>
  )
}
