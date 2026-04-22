import { useState, useEffect, useRef } from 'react'
import { agentKeys, agentLabels, agentReplies, agentFallbackReplies, agentImageReplies, imageEnabledAgents } from '../data/agentConfig.js'
// eslint-disable-next-line no-unused-vars
import { buildSystemPrompt } from '../services/anthropic.js'
import './ChatPanel.css'

function buildOpeningMessages(agentKey, overrideText) {
  return [{ role: 'agent', text: overrideText ?? agentReplies[agentKey] }]
}

export default function ChatPanel({ activeAgent, onAgentChange, initialMessage }) {
  const [messages, setMessages] = useState(() => buildOpeningMessages(activeAgent, initialMessage))
  const [input, setInput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const listRef = useRef(null)
  const fileInputRef = useRef(null)

  const supportsImageDrop = imageEnabledAgents.includes(activeAgent)

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
    // buildSystemPrompt(activeAgent) returns the full system prompt for this agent,
    // combining its role, personality, and relevant knowledge files.
    //
    // To go live, replace this setTimeout with:
    //
    //   const systemPrompt = buildSystemPrompt(activeAgent)
    //   const reply = await AnthropicService.chat({
    //     agentKey: activeAgent,
    //     systemPrompt,
    //     messages,
    //     userMessage: text,
    //   })
    //   setMessages(prev => [...prev, { role: 'agent', text: reply }])
    //
    // Until VITE_ANTHROPIC_API_KEY is set, the mock reply below is used.
    void buildSystemPrompt(activeAgent) // imported and ready
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'agent', text: agentFallbackReplies[activeAgent] }])
    }, 550)
    // --- END INTEGRATION POINT ---
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setMessages(prev => [...prev, { role: 'user', type: 'image', src: e.target.result, name: file.name }])
      setTimeout(() => {
        const reply = agentImageReplies[activeAgent] ?? agentFallbackReplies[activeAgent]
        setMessages(prev => [...prev, { role: 'agent', text: reply }])
      }, 700)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (!supportsImageDrop) return
    const file = e.dataTransfer.files[0]
    processImageFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (supportsImageDrop) setDragOver(true)
  }

  function handleFileSelect(e) {
    processImageFile(e.target.files[0])
    e.target.value = ''
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

      <div
        className={`chat-messages${dragOver ? ' drag-over' : ''}`}
        ref={listRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
      >
        {dragOver && (
          <div className="drop-overlay">
            <span className="drop-overlay-icon">📄</span>
            <span>Drop invoice or bill image here</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.role === 'agent' && (
              <span className="chat-msg-label">{agentLabels[activeAgent]}</span>
            )}
            {msg.type === 'image' ? (
              <div className="chat-bubble image-bubble">
                <img src={msg.src} alt={msg.name} className="chat-image" />
                <span className="chat-image-name">{msg.name}</span>
              </div>
            ) : (
              <div className="chat-bubble">{msg.text}</div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        {supportsImageDrop && (
          <>
            <button
              className="attach-btn"
              title="Attach invoice or bill"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </>
        )}
        <input
          className="chat-input"
          placeholder={supportsImageDrop ? `Message ${agentLabels[activeAgent]} or drop an image…` : `Message ${agentLabels[activeAgent]}…`}
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
