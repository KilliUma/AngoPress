export default function DashboardLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-3 shadow-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-600" />
        <p className="text-sm font-medium text-neutral-700">A carregar o sistema...</p>
      </div>
    </div>
  )
}
