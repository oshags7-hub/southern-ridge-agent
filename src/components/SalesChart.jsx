import './SalesChart.css'

const RAW = [
  { day: 'Mon', value: 1240 },
  { day: 'Tue', value:  980 },
  { day: 'Wed', value: 1580 },
  { day: 'Thu', value: 1840 },
  { day: 'Fri', value:    0 },
  { day: 'Sat', value:    0 },
  { day: 'Sun', value:    0 },
]

// Convert JS getDay() (0=Sun) to Mon-indexed
const jsDay = new Date().getDay()
const todayIdx = jsDay === 0 ? 6 : jsDay - 1

const maxVal = Math.max(...RAW.filter(d => d.value > 0).map(d => d.value), 1)

function barType(i) {
  if (i < todayIdx)  return 'past'
  if (i === todayIdx) return 'today'
  return 'future'
}

export default function SalesChart() {
  return (
    <div className="sales-chart">
      <div className="sales-chart-header">
        <span className="chart-title">Weekly revenue</span>
        <div className="chart-legend">
          <span className="legend-swatch past" /><span>Past</span>
          <span className="legend-swatch today" /><span>Today</span>
          <span className="legend-swatch future" /><span>Upcoming</span>
        </div>
      </div>

      <div className="chart-bars">
        {RAW.map((d, i) => {
          const type = barType(i)
          const heightPct = type !== 'future' && d.value > 0
            ? (d.value / maxVal) * 100
            : 0
          return (
            <div key={d.day} className="chart-col">
              <span className="bar-val">
                {type !== 'future' && d.value > 0 ? `$${(d.value / 1000).toFixed(1)}k` : ''}
              </span>
              <div className="bar-track">
                <div
                  className={`bar-fill ${type}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="bar-day">{d.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
