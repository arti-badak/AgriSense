export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  )
}
