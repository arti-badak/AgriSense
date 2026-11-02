import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buildDemoPayload } from '../lib/demoData'
import { createId, loadState, saveState } from '../lib/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState())
  const [toast, setToast] = useState(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const showToast = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() })
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  const addFarm = useCallback(
    (farm) => {
      const record = {
        ...farm,
        id: createId('farm'),
        createdAt: new Date().toISOString(),
        isDemo: false,
      }
      setState((prev) => ({ ...prev, farms: [record, ...prev.farms] }))
      showToast('success', 'Farm saved.')
      return record
    },
    [showToast],
  )

  const updateFarm = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        farms: prev.farms.map((farm) => (farm.id === id ? { ...farm, ...updates } : farm)),
        readings: prev.readings.map((reading) =>
          reading.farmId === id ? { ...reading, farmName: updates.name ?? reading.farmName } : reading,
        ),
        recommendations: prev.recommendations.map((rec) =>
          rec.farmId === id ? { ...rec, farmName: updates.name ?? rec.farmName } : rec,
        ),
      }))
      showToast('success', 'Farm details updated.')
    },
    [showToast],
  )

  const deleteFarm = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        farms: prev.farms.filter((farm) => farm.id !== id),
        readings: prev.readings.filter((reading) => reading.farmId !== id),
        recommendations: prev.recommendations.filter((rec) => rec.farmId !== id),
      }))
      showToast('success', 'Farm and related records removed.')
    },
    [showToast],
  )

  const addReading = useCallback(
    (reading) => {
      const record = {
        ...reading,
        id: createId('reading'),
        createdAt: new Date().toISOString(),
        isDemo: false,
      }
      setState((prev) => ({ ...prev, readings: [record, ...prev.readings] }))
      showToast('success', 'Crop reading saved.')
      return record
    },
    [showToast],
  )

  const deleteReading = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        readings: prev.readings.filter((reading) => reading.id !== id),
      }))
      showToast('success', 'Reading deleted.')
    },
    [showToast],
  )

  const addRecommendation = useCallback(
    (entry) => {
      const record = {
        ...entry,
        id: createId('rec'),
        createdAt: new Date().toISOString(),
        isDemo: false,
      }
      const linkedReading = {
        id: createId('reading'),
        farmId: record.farmId,
        farmName: record.farmName,
        cropType: record.cropType,
        moisture: record.moisture,
        pH: record.pH,
        temperature: record.temperature,
        createdAt: record.createdAt,
        isDemo: false,
      }
      setState((prev) => ({
        ...prev,
        recommendations: [record, ...prev.recommendations],
        readings: [linkedReading, ...prev.readings],
      }))
      showToast('success', 'Recommendation generated and saved.')
      return record
    },
    [showToast],
  )

  const deleteRecommendation = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        recommendations: prev.recommendations.filter((rec) => rec.id !== id),
      }))
      showToast('success', 'History entry deleted.')
    },
    [showToast],
  )

  const loadDemoData = useCallback(() => {
    const demo = buildDemoPayload()
    setState((prev) => {
      const farms = [
        ...demo.farms.filter((farm) => !prev.farms.some((existing) => existing.id === farm.id)),
        ...prev.farms,
      ]
      const readings = [
        ...demo.readings.filter((reading) => !prev.readings.some((existing) => existing.id === reading.id)),
        ...prev.readings,
      ]
      const recommendations = [
        ...demo.recommendations.filter((rec) => !prev.recommendations.some((existing) => existing.id === rec.id)),
        ...prev.recommendations,
      ]
      return { ...prev, farms, readings, recommendations }
    })
    showToast('success', 'Demo farm, readings, and recommendations loaded.')
  }, [showToast])

  const resetAllData = useCallback(() => {
    setState({ schemaVersion: 1, farms: [], readings: [], recommendations: [] })
    showToast('success', 'All local demonstration data cleared.')
  }, [showToast])

  const value = useMemo(
    () => ({
      farms: state.farms,
      readings: state.readings,
      recommendations: state.recommendations,
      toast,
      showToast,
      clearToast,
      addFarm,
      updateFarm,
      deleteFarm,
      addReading,
      deleteReading,
      addRecommendation,
      deleteRecommendation,
      loadDemoData,
      resetAllData,
    }),
    [
      state.farms,
      state.readings,
      state.recommendations,
      toast,
      showToast,
      clearToast,
      addFarm,
      updateFarm,
      deleteFarm,
      addReading,
      deleteReading,
      addRecommendation,
      deleteRecommendation,
      loadDemoData,
      resetAllData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
