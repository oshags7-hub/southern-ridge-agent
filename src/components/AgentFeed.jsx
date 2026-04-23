import { agentAlerts } from '../mockData.js'
import { AGENTS } from '../config/agents.js'
import './AgentFeed.css'

const URGENCY_COLORS = {
  high: 'var(--red-alert)',
  medium: 'var(--gold-alert)',
  low: 'var(--green-ok)',
}

export default function AgentFeed({ onAlertClick }) {
  return (
    <div className="agent-feed" id="agent-feed">
      {agentAlerts.map((alert, i) => {
        const agent = AGENTS[alert.agentKey] ?? { abbr: '??', icon: { bg: 'var(--parchment)', color: 'var(--ash)' } }
        return (
          <div
            key={alert.id}
            className={`feed-item${i === agentAlerts.length - 1 ? ' last' : ''}`}
            onClick={() => onAlertClick?.(alert.agentKey)}
          >
            <span
              className="urgency-pip"
              style={{ background: URGENCY_COLORS[alert.urgency] }}
            />
            <span
              className="agent-icon"
              style={{ background: agent.icon.bg, color: agent.icon.color }}
            >
              {agent.abbr}
            </span>
            <div className="feed-body">
              <span className="agent-name">{alert.agentName.toUpperCase()}</span>
              <span className="alert-text">{alert.text}</span>
              <span className="action-label">{alert.action}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
