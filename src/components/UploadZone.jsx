import { useState, useRef } from 'react'
import './UploadZone.css'

const TYPE_CHIPS = ['PDF', 'JPG photo', 'CSV', 'Excel']

export default function UploadZone() {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFile(f) {
    if (f) setFile(f)
  }

  return (
    <div
      className={`upload-zone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
      onClick={() => !file && inputRef.current?.click()}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
    >
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {file ? (
        <div className="upload-result">
          <span className="upload-file-icon">📄</span>
          <span className="upload-filename">{file.name}</span>
          <span className="upload-done">Categorized ✓</span>
        </div>
      ) : (
        <>
          <span className="upload-title">Drop a document</span>
          <span className="upload-sub">Receipts, invoices, bank statements</span>
          <span className="upload-sub2">Bookkeeper reads and categorizes automatically</span>
          <div className="upload-chips">
            {TYPE_CHIPS.map(t => (
              <span key={t} className="upload-chip">{t}</span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
