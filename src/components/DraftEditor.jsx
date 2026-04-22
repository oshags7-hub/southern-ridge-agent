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

export default function DraftEditor({ draft }) {
  const [content, setContent] = useState(draft.content)

  useEffect(() => {
    setContent(draft.content)
  }, [draft.id])

  function applyTone(toneKey) {
    const variant = toneVariants[draft.id]?.[toneKey]
    if (variant) setContent(variant)
  }

  function handleCopy() {
    navigator.clipboard.writeText(content)
  }

  function handleApprove() {
    if (FEATURES.autoPosting) {
      alert(`"${draft.title}" approved and scheduled.`)
    } else {
      navigator.clipboard.writeText(content)
      alert(`"${draft.title}" copied. Mark it done in your publishing tool.`)
    }
  }

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
        <button className="footer-btn ghost">Skip</button>
        <button className="footer-btn ghost" onClick={handleCopy}>Copy</button>
        <button className="footer-btn approve" onClick={handleApprove}>
          {FEATURES.autoPosting ? 'Approve & schedule' : 'Copy & mark done'}
        </button>
      </div>
    </div>
  )
}
