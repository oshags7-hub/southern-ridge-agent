import './ProfitAnalysis.css'

const PRODUCTS = [
  { name: 'Bulk beef shares',        margin: 78, tag: 'Grow'             },
  { name: 'Smokehouse specials',     margin: 71, tag: 'Grow'             },
  { name: 'Retail beef cuts',        margin: 58, tag: 'Watch'            },
  { name: 'Wild-caught seafood',     margin: 44, tag: 'Watch'            },
  { name: 'Third-party baked goods', margin: 22, tag: 'Consider cutting' },
  { name: 'Local pantry goods',      margin: 18, tag: 'Consider cutting' },
]

function marginColor(pct) {
  if (pct >= 60) return '#2d6a3f'
  if (pct >= 35) return '#8B6914'
  return '#c0392b'
}

function tagStyle(tag) {
  if (tag === 'Grow')             return { background: '#d4edda', color: '#2d6a3f' }
  if (tag === 'Watch')            return { background: '#FDF3E0', color: '#8B6914' }
  return                                 { background: '#fde8e8', color: '#c0392b' }
}

export default function ProfitAnalysis({ onBookkeeperAsk }) {
  return (
    <div className="profit-analysis">
      <div className="profit-header">
        <span className="profit-title">AI profit analysis</span>
        <button
          className="profit-link"
          onClick={() => onBookkeeperAsk?.('Break down my margins by product category')}
        >
          Ask Bookkeeper for detail →
        </button>
      </div>

      <div className="profit-rows">
        {PRODUCTS.map((p, i) => (
          <div
            key={p.name}
            className={`profit-row${i === PRODUCTS.length - 1 ? ' last' : ''}`}
          >
            <span className="profit-name">{p.name}</span>
            <div className="profit-bar-track">
              <div
                className="profit-bar-fill"
                style={{ width: `${p.margin}%`, background: marginColor(p.margin) }}
              />
            </div>
            <span className="profit-pct" style={{ color: marginColor(p.margin) }}>
              {p.margin}%
            </span>
            <span className="profit-tag" style={tagStyle(p.tag)}>{p.tag}</span>
          </div>
        ))}
      </div>

      <div className="profit-insight">
        Bookkeeper: Bulk beef shares drive 42% of total revenue at your highest margin.
        Smokehouse products may be underpriced relative to their value — a 10% price
        increase would add ~$380/month. Third-party pantry goods tie up shelf space at
        margins below carrying cost. Consider replacing with higher-margin SRF products.
      </div>
    </div>
  )
}
