import { useState, useEffect, useRef } from 'react'
import { AGENTS, CHAT_AGENT_KEYS } from '../config/agents.js'
import { sendMessage, agentNeedsShopifyData } from '../services/anthropic.js'
import './ChatPanel.css'

// Per-agent selected-pill background colors
const PILL_COLORS = {
  watchman:   'var(--moss)',
  paymaster:  '#8B6914',
  bookkeeper: '#2E5A8A',
  shepherd:   'var(--amber)',
  harvester:  'var(--ash)',
  storyteller:'#6B4A9E',
  educator:   'var(--pasture)',
}

export default function ChatPanel({ activeAgent, onAgentChange, initialMessage, prefillInput }) {
  const [response, setResponse] = useState(initialMessage ? { text: initialMessage } : null)
  const [input, setInput] = useState(prefillInput ?? '')
  const [typing, setTyping] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [apiHistory, setApiHistory] = useState([])
  const inputRef = useRef(null)

  const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY
  const isBusy = typing || loadingData

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleAsk() {
    const question = input.trim()
    if (!question || isBusy) return
    setInput('')

    const needsData = agentNeedsShopifyData(activeAgent) && !!import.meta.env.VITE_WORKER_URL
    if (needsData) setLoadingData(true)
    else setTyping(true)

    const nextHistory = [...apiHistory, { role: 'user', content: question }]

    try {
      const reply = await sendMessage({
        agentKey: activeAgent,
        history: apiHistory,
        userMessage: question,
      })
      setLoadingData(false)
      setTyping(true)
      setApiHistory([...nextHistory, { role: 'assistant', content: reply }])
      setResponse({ text: reply })
    } catch (err) {
      const msg = hasApiKey
        ? `Something went wrong. (${err.message})`
        : 'Add VITE_ANTHROPIC_API_KEY to .env.local to enable live responses.'
      setResponse({ text: msg })
    } finally {
      setLoadingData(false)
      setTyping(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const agentLabel = AGENTS[activeAgent]?.label ?? activeAgent

  return (
    <div className="ask-panel">
      <span className="ask-section-label">Ask an agent</span>

      <div className="ask-who-row">
        <span className="ask-who-label">Who are you asking?</span>
        <div className="ask-pills">
          {CHAT_AGENT_KEYS.map(key => {
            const isActive = key === activeAgent
            const color = PILL_COLORS[key] ?? 'var(--ash)'
            return (
              <button
                key={key}
                className={`ask-pill${isActive ? ' active' : ''}`}
                style={isActive
                  ? { background: color, borderColor: 'transparent', color: 'var(--cream)' }
                  : {}}
                onClick={() => onAgentChange(key)}
              >
                {AGENTS[key]?.label ?? key}
              </button>
            )
          })}
        </div>
      </div>

      <div className="ask-input-row">
        <input
          ref={inputRef}
          className="ask-input"
          placeholder={`Ask ${agentLabel} a question…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy}
        />
        <button
          className="ask-btn"
          onClick={handleAsk}
          disabled={!input.trim() || isBusy}
        >
          {isBusy ? '…' : 'Ask'}
        </button>
      </div>

      {(response || isBusy) && (
        <div className="ask-response-area">
          <span className="ask-response-label">{agentLabel}</span>
          <div className="ask-response-bubble">
            {isBusy ? (
              loadingData ? (
                <span className="ask-loading-text">Loading your data…</span>
              ) : (
                <div className="ask-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )
            ) : (
              response?.text
            )}
          </div>
        </div>
      )}
    </div>
  )
}
