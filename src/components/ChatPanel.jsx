import { useState, useEffect, useRef } from 'react'
import { agentKeys, agentLabels, agentReplies, agentFallbackReplies } from '../data/agentConfig.js'
// eslint-disable-next-line no-unused-vars
import * as AnthropicService from '../services/anthropic.js'
import './ChatPanel.css'

function buildOpeningMessages(agentKey, overrideText) {
  return [{ role: 'agent', text: overrideText ?? agentReplies[agentKey] }]
}

export default function ChatPanel({ activeAgent, onAgentChange, initialMessage }) {
  const [messages, setMessages] = useState(() => buildOpeningMessages(activeAgent, initialMessage))
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    setMessages(buildOpeningMessages(activeAgent, initialMessage))
    setInput('')
  }, [activeAgent, initialMessage])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])

    // --- ANTHROPIC INTEGRATION POINT ---
    // Replace this setTimeout block with a real API call via AnthropicService.
    // Example shape:
    //   const reply = await AnthropicService.chat({ agentKey: activeAgent, messages, userMessage: text })
    //   setMessages(prev => [...prev, { role: 'agent', text: reply }])
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'agent', text: agentFallbackReplies[activeAgent] },
      ])
    }, 550)
    // --- END INTEGRATION POINT ---
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-agent-bar">
        {agentKeys.map(key => (
          <button
            key={key}
            className={`agent-pill${activeAgent === key ? ' active' : ''}`}
            onClick={() => onAgentChange(key)}
          >
            {agentLabels[key]}
          </button>
        ))}
      </div>

      <div className="chat-messages" ref={listRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.role === 'agent' && (
              <span className="chat-msg-label">{agentLabels[activeAgent]}</span>
            )}
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder={`Message ${agentLabels[activeAgent]}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
