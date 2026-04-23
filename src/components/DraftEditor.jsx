import { useState, useEffect } from 'react'
import { toneVariants } from '../data/toneVariants.js'
import { FEATURES } from '../config/features.js'
import './DraftEditor.css'

const TONE_BUTTONS = [
  { key: 'shorter',     label: 'Make shorter' },
  { key: 'farmStory',   label: 'Add farm story' },
  { key: 'strongerCTA', label: 'Stronger CTA' },
  { key: 'faith',       label: 'Faith tone' },
]

export default function DraftEditor({ draft, onApprove, onSkip }) {
  const [content, setContent] = useState(draft.content)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setContent(draft.content)
    setCopied(false)
  }, [draft.id])

  function applyTone(toneKey) {
    const variant = toneVariants[draft.id]?.[toneKey]
    if (variant) setContent(variant)
  }

  function handleCopy() {
    navigator.clipboard.writeText(content)
  }

  async function handleApprove() {
    if (FEATURES.autoPosting) {
      onApprove?.(draft.id)
    } else {
      await navigator.clipboard.writeText(content).catch(() => {})
      onApprove?.(draft.id)
      setCopied(true)
    }
  }

  function handleSkip() {
    onSkip?.(draft.id)
  }

  const isApproved = draft.status === 'approved'
  const isSkipped = draft.status === 'skipped'
  const isDone = isApproved || isSkipped

  return (
    <div className="draft-editor">
      <div className="editor-header">
        <span className="editor-title">{draft.title}</span>
        <span className="editor-meta">{draft.meta}</span>
        <span className="editor-charcount">{content.length} chars</span>
      </div>

      <textarea
        className="editor-textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="editor-tone-row">
        {TONE_BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            className="tone-btn"
            onClick={() => applyTone(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="editor-footer">
        {copied && (
          <span className="copied-confirm">Copied — ready to paste</span>
        )}
        <button
          className="footer-btn ghost"
          onClick={handleSkip}
          disabled={isDone}
        >
          {isSkipped ? 'Skipped' : 'Skip'}
        </button>
        <button className="footer-btn ghost" onClick={handleCopy}>Copy</button>
        <button
          className={`footer-btn approve${isApproved ? ' done' : ''}`}
          onClick={handleApprove}
          disabled={isDone}
        >
          {isApproved
            ? 'Approved'
            : FEATURES.autoPosting
            ? 'Approve & schedule'
            : 'Copy & mark done'}
        </button>
      </div>
    </div>
  )
}
