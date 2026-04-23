import { useState, useEffect, useRef } from 'react'
import { agentKeys, agentLabels, agentReplies, agentImageReplies, imageEnabledAgents } from '../data/agentConfig.js'
import { sendMessage, agentNeedsShopifyData } from '../services/anthropic.js'
import './ChatPanel.css'

// Display message: { role: 'user'|'agent', text?, type?: 'image', src?, name? }
// API history:     { role: 'user'|'assistant', content: string }

function buildOpening(agentKey, overrideText) {
  return {
    display: [{ role: 'agent', text: overrideText ?? agentReplies[agentKey] }],
    // Opening message is UI-only — not sent to API as history
    history: [],
  }
}

export default function ChatPanel({ activeAgent, onAgentChange, initialMessage }) {
  const opening = buildOpening(activeAgent, initialMessage)
  const [messages, setMessages] = useState(opening.display)
  const [apiHistory, setApiHistory] = useState(opening.history)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const listRef = useRef(null)
  const fileInputRef = useRef(null)

  const supportsImageDrop = imageEnabledAgents.includes(activeAgent)
  const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY

  useEffect(() => {
    const o = buildOpening(activeAgent, initialMessage)
    setMessages(o.display)
    setApiHistory(o.history)
    setInput('')
    setTyping(false)
    setLoadingData(false)
  }, [activeAgent, initialMessage])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, typing])

  async function handleSend() {
    const text = input.trim()
    if (!text || typing) return
    setInput('')

    const userDisplay = { role: 'user', text }
    setMessages(prev => [...prev, userDisplay])

    const needsData = agentNeedsShopifyData(activeAgent) && !!import.meta.env.VITE_WORKER_URL
    if (needsData) setLoadingData(true)
    else setTyping(true)

    const nextHistory = [...apiHistory, { role: 'user', content: text }]

    try {
      const reply = await sendMessage({
        agentKey: activeAgent,
        history: apiHistory,
        userMessage: text,
      })
      setLoadingData(false)
      setTyping(true)
      setApiHistory([...nextHistory, { role: 'assistant', content: reply }])
      setMessages(prev => [...prev, { role: 'agent', text: reply }])
    } catch (err) {
      const fallback = hasApiKey
        ? `Something went wrong reaching the server. (${err.message})`
        : 'API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local to enable live responses.'
      setMessages(prev => [...prev, { role: 'agent', text: fallback }])
    } finally {
      setLoadingData(false)
      setTyping(false)
    }
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
    reader.onload = async (e) => {
      const imgDisplay = { role: 'user', type: 'image', src: e.target.result, name: file.name }
      setMessages(prev => [...prev, imgDisplay])
      setTyping(true)

      // Image messages use a descriptive text in API history
      const imageMsg = `[User attached an image: ${file.name}]`
      const nextHistory = [...apiHistory, { role: 'user', content: imageMsg }]

      try {
        const reply = hasApiKey
          ? await sendMessage({ agentKey: activeAgent, history: apiHistory, userMessage: imageMsg })
          : (agentImageReplies[activeAgent] ?? 'Image received.')

        // Short delay for mock path so it feels natural
        if (!hasApiKey) await new Promise(r => setTimeout(r, 700))

        setApiHistory([...nextHistory, { role: 'assistant', content: reply }])
        setMessages(prev => [...prev, { role: 'agent', text: reply }])
      } catch {
        setMessages(prev => [...prev, { role: 'agent', text: agentImageReplies[activeAgent] ?? 'Image received.' }])
      } finally {
        setTyping(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (!supportsImageDrop) return
    processImageFile(e.dataTransfer.files[0])
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
        onDragOver={e => { e.preventDefault(); if (supportsImageDrop) setDragOver(true) }}
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

        {loadingData && (
          <div className="chat-message agent">
            <span className="chat-msg-label">{agentLabels[activeAgent]}</span>
            <div className="chat-bubble loading-data-bubble">Loading your data…</div>
          </div>
        )}

        {typing && (
          <div className="chat-message agent">
            <span className="chat-msg-label">{agentLabels[activeAgent]}</span>
            <div className="chat-bubble typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
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
          disabled={typing || loadingData}
        />
        <button
          className="chat-send"
          onClick={handleSend}
          disabled={!input.trim() || typing || loadingData}
        >
          {loadingData ? '…' : typing ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
