import { useEffect } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast, clearToast } = useApp()

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(clearToast, 4200)
    return () => clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border bg-white px-4 py-3 shadow-lg"
      style={{ borderColor: isError ? '#fecaca' : '#bbf7d0' }}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        )}
        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
        <button
          type="button"
          onClick={clearToast}
          className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
