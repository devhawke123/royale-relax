type RevenuePoint = { date: string; revenue: number }

const WIDTH = 720
const HEIGHT = 220
const PADDING_X = 8
const PADDING_Y = 16

function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  )
}

/**
 * Hand-rolled SVG line chart — no charting library is installed and the
 * project has no other chart usage, so pulling one in for a single sparkline
 * felt like more dependency weight than the feature needs.
 */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-stone-500">No revenue data yet.</p>
  }

  const max = Math.max(...data.map((d) => d.revenue), 1)
  const innerWidth = WIDTH - PADDING_X * 2
  const innerHeight = HEIGHT - PADDING_Y * 2

  const points = data.map((d, i) => {
    const x = PADDING_X + (i / (data.length - 1 || 1)) * innerWidth
    const y = PADDING_Y + innerHeight - (d.revenue / max) * innerHeight
    return { x, y, d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)},${HEIGHT - PADDING_Y} L${points[0].x.toFixed(2)},${HEIGHT - PADDING_Y} Z`

  const firstLabel = formatDayLabel(data[0].date)
  const midLabel = formatDayLabel(data[Math.floor(data.length / 2)].date)
  const lastLabel = formatDayLabel(data[data.length - 1].date)

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Revenue over time">
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b87333" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#b87333" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={PADDING_Y + innerHeight * (1 - f)}
            y2={PADDING_Y + innerHeight * (1 - f)}
            stroke="#e7e5e4"
            strokeDasharray="4 4"
          />
        ))}
        <path d={areaPath} fill="url(#revenue-fill)" />
        <path d={linePath} fill="none" stroke="#b87333" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#b87333" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-stone-500">
        <span>{firstLabel}</span>
        <span>{midLabel}</span>
        <span>{lastLabel}</span>
      </div>
      <p className="mt-1 text-xs text-stone-400">Peak day: {formatCurrency(max)}</p>
    </div>
  )
}
