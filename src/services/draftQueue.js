import { useState, useEffect, useCallback } from 'react'
import { drafts as mockDrafts } from '../mockData.js'

const STORAGE_KEY = 'srm_draft_queue_v1'

function seed() {
  return mockDrafts.map(d => ({
    ...d,
    agentKey: d.agentKey ?? 'storyteller',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }))
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return seed()
}

function save(drafts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch {}
}

export function useDraftQueue() {
  const [drafts, setDrafts] = useState(load)

  useEffect(() => {
    save(drafts)
  }, [drafts])

  const addDraft = useCallback(draft => {
    setDrafts(prev => [draft, ...prev])
  }, [])

  const approveDraft = useCallback(id => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d))
  }, [])

  const skipDraft = useCallback(id => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'skipped' } : d))
  }, [])

  const clearApproved = useCallback(() => {
    setDrafts(prev => prev.filter(d => d.status !== 'approved'))
  }, [])

  return { drafts, addDraft, approveDraft, skipDraft, clearApproved }
}
