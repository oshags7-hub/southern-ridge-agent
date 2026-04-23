import { useState } from 'react'
import { useDraftQueue } from '../services/draftQueue.js'
import { generateStorytellerDraft } from '../services/generators.js'
import { getProducts } from '../services/shopify.js'
import DraftList from './DraftList.jsx'
import GenerateBox from './GenerateBox.jsx'
import DraftEditor from './DraftEditor.jsx'
import './ContentStudio.css'

export default function ContentStudio() {
  const { drafts, addDraft, approveDraft, skipDraft } = useDraftQueue()
  const [selectedId, setSelectedId] = useState(() => drafts[0]?.id ?? null)
  const [generating, setGenerating] = useState(false)

  const selectedDraft = drafts.find(d => d.id === selectedId) ?? drafts[0] ?? null

  async function handleGenerate(prompt) {
    setGenerating(true)
    try {
      let products = []
      if (import.meta.env.VITE_WORKER_URL) {
        products = await getProducts().catch(() => [])
      }
      const draft = await generateStorytellerDraft(prompt, products)
      addDraft(draft)
      setSelectedId(draft.id)
    } catch (err) {
      const fallback = {
        id: `draft_${Date.now()}`,
        platform: 'Draft',
        title: prompt.length > 45 ? prompt.slice(0, 45) + '…' : prompt,
        meta: 'generated · error',
        content: `Generation failed: ${err.message}\n\nYour prompt:\n${prompt}`,
        agentKey: 'storyteller',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      addDraft(fallback)
      setSelectedId(fallback.id)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="content-studio">
      <div className="studio-left">
        <DraftList
          drafts={drafts}
          selectedId={selectedId ?? drafts[0]?.id}
          onSelect={setSelectedId}
        />
        <GenerateBox onGenerate={handleGenerate} generating={generating} />
      </div>
      <div className="studio-right">
        {selectedDraft && (
          <DraftEditor
            draft={selectedDraft}
            onApprove={approveDraft}
            onSkip={skipDraft}
          />
        )}
      </div>
    </div>
  )
}
