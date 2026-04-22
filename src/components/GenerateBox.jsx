import { useState } from 'react'
import './GenerateBox.css'

export default function GenerateBox({ onGenerate }) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    const text = value.trim()
    if (!text) return
    onGenerate(text)
    setValue('')
  }

  return (
    <div className="generate-box">
      <span className="generate-label">Generate new draft</span>
      <textarea
        className="generate-textarea"
        placeholder="e.g. New dry-aged ribeyes just cut…"
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={3}
      />
      <button
        className="generate-btn"
        onClick={handleSubmit}
        disabled={!value.trim()}
      >
        Generate draft
      </button>
    </div>
  )
}
