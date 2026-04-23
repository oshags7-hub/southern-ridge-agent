import { useState } from 'react'
import './GenerateBox.css'

export default function GenerateBox({ onGenerate, generating = false }) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    const text = value.trim()
    if (!text || generating) return
    onGenerate(text)
    setValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="generate-box">
      <span className="generate-label">Generate new draft</span>
      <textarea
        className="generate-textarea"
        placeholder="e.g. New dry-aged ribeyes just cut…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        disabled={generating}
      />
      <button
        className="generate-btn"
        onClick={handleSubmit}
        disabled={!value.trim() || generating}
      >
        {generating ? 'Generating…' : 'Generate draft'}
      </button>
    </div>
  )
}
