import { useState } from 'react'
import AgentFeed from './AgentFeed.jsx'
import ChatPanel from './ChatPanel.jsx'
import { agentReplies } from '../data/agentConfig.js'
import { agentAlerts } from '../mockData.js'
import { useDraftQueue } from '../services/draftQueue.js'
import { getAtRiskCustomers } from '../services/shopify.js'
import { generateShepherdDraft } from '../services/generators.js'
import './Dashboard.css'

export default function Dashboard({ onSwitchToStudio }) {
  const [activeAgent, setActiveAgent] = useState('watchman')
  const [initialMessage, setInitialMessage] = useState(null)
  const [chatKey, setChatKey] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [reengagementStatus, setReengagementStatus] = useState('')

  const { addDraft } = useDraftQueue()

  function handleAlertClick(agentKey) {
    const alert = agentAlerts.find(a => a.agentKey === agentKey)
    const text = alert
      ? `${alert.text} — ${alert.action}`
      : agentReplies[agentKey]

    if (activeAgent === agentKey) {
      setInitialMessage(text)
      setChatKey(k => k + 1)
    } else {
      setActiveAgent(agentKey)
      setInitialMessage(text)
    }
  }

  function handleFeedClick(agentKey) {
    if (agentKey === 'storyteller') {
      onSwitchToStudio?.()
      return
    }
    handleAlertClick(agentKey)
  }

  async function handleGenerateReengagement() {
    if (!import.meta.env.VITE_WORKER_URL) {
      setReengagementStatus('Shopify not connected — add VITE_WORKER_URL to .env.local')
      return
    }

    setGenerating(true)
    setReengagementStatus('')

    try {
      const customers = await getAtRiskCustomers()
      const batch = customers.slice(0, 5)

      if (!batch.length) {
        setReengagementStatus('No at-risk customers found')
        setGenerating(false)
        return
      }

      const results = await Promise.allSettled(
        batch.map(c => generateShepherdDraft(c))
      )

      let count = 0
      for (const r of results) {
        if (r.status === 'fulfilled') {
          addDraft(r.value)
          count++
        }
      }

      setReengagementStatus(`${count} draft${count !== 1 ? 's' : ''} added to Content Studio`)
      if (count > 0) {
        setTimeout(() => {
          onSwitchToStudio?.()
          setReengagementStatus('')
        }, 1200)
      }
    } catch (err) {
      setReengagementStatus(`Error: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-left">
        <AgentFeed onAlertClick={handleFeedClick} />
        <div className="reengagement-bar">
          <button
            className="reengagement-btn"
            onClick={handleGenerateReengagement}
            disabled={generating}
          >
            {generating ? 'Generating drafts…' : 'Generate re-engagement drafts'}
          </button>
          {reengagementStatus && (
            <span className="reengagement-status">{reengagementStatus}</span>
          )}
        </div>
      </div>
      <ChatPanel
        key={chatKey}
        activeAgent={activeAgent}
        onAgentChange={key => {
          setActiveAgent(key)
          setInitialMessage(null)
        }}
        initialMessage={initialMessage}
      />
    </div>
  )
}
