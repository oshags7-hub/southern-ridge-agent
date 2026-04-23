import './MetricsRow.css'

const METRICS = [
  { value: '$1,840',  label: "Today's sales",      delta: '↑ 14% vs last Thu',   up: true  },
  { value: '$38,200', label: 'Month to date',       delta: "↑ 9% vs April '25",   up: true  },
  { value: '247',     label: 'Active subscribers',  delta: '↑ 3 this week',        up: true  },
  { value: '68%',     label: 'Avg margin',          delta: '↓ 2pts vs last month', up: false },
]

export default function MetricsRow() {
  return (
    <div className="metrics-row">
      {METRICS.map(m => (
        <div key={m.label} className="metric-card">
          <span className="metric-value">{m.value}</span>
          <span className="metric-label">{m.label}</span>
          <span className={`metric-delta ${m.up ? 'up' : 'down'}`}>{m.delta}</span>
        </div>
      ))}
    </div>
  )
}
