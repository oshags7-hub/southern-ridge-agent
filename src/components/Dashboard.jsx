import { useState } from 'react'
import AgentFeed from './AgentFeed.jsx'
import ChatPanel from './ChatPanel.jsx'
import { agentReplies } from '../data/agentConfig.js'
import { agentAlerts } from '../mockData.js'
import './Dashboard.css'

export default function Dashboard({ onSwitchToStudio }) {
  const [activeAgent, setActiveAgent] = useState('watchman')
  const [initialMessage, setInitialMessage] = useState(null)
  // Track a key to force ChatPanel to re-mount when same agent is clicked again
  const [chatKey, setChatKey] = useState(0)

  function handleAlertClick(agentKey) {
    const alert = agentAlerts.find(a => a.agentKey === agentKey)
    const text = alert
      ? `${alert.text} — ${alert.action}`
      : agentReplies[agentKey]

    if (activeAgent === agentKey) {
      // Same agent: bump key to reset the panel with the new message
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

  return (
    <div className="dashboard">
      <AgentFeed onAlertClick={handleFeedClick} />
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
