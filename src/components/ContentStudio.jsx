import { useState } from 'react'
import { drafts as initialDrafts } from '../mockData.js'
import DraftList from './DraftList.jsx'
import GenerateBox from './GenerateBox.jsx'
import DraftEditor from './DraftEditor.jsx'
import './ContentStudio.css'

let nextId = initialDrafts.length + 1

export default function ContentStudio() {
  const [drafts, setDrafts] = useState(initialDrafts)
  const [selectedId, setSelectedId] = useState(initialDrafts[0].id)

  const selectedDraft = drafts.find(d => d.id === selectedId)

  function handleGenerate(prompt) {
    const newDraft = {
      id: nextId++,
      platform: 'Draft',
      title: prompt.length > 40 ? prompt.slice(0, 40) + '…' : prompt,
      meta: 'generated · unsaved',
      content: `[Generated from prompt]\n\n${prompt}\n\n— Edit this draft to shape your message.`,
    }
    setDrafts(prev => [newDraft, ...prev])
    setSelectedId(newDraft.id)
  }

  return (
    <div className="content-studio">
      <div className="studio-left">
        <DraftList
          drafts={drafts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <GenerateBox onGenerate={handleGenerate} />
      </div>
      <div className="studio-right">
        {selectedDraft && <DraftEditor draft={selectedDraft} />}
      </div>
    </div>
  )
}
