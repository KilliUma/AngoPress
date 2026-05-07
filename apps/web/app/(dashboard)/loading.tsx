export default function DashboardLoading() {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-neutral-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(138,0,24,0.08),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(92,0,16,0.08),transparent_38%)]" />
      <div className="relative flex items-center gap-3 rounded-xl border border-brand-100 bg-white px-5 py-3 shadow-md shadow-brand-100/60">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <p className="text-sm font-semibold text-brand-900">A carregar o sistema...</p>
      </div>
    </div>
  )
}
