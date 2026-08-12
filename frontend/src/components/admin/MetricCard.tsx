export function MetricCard({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-5 ${className}`}>
      <div className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-stone-900">{value}</div>
    </div>
  )
}
