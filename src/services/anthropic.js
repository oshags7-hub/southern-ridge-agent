// Anthropic API
// NOTE: This calls the API directly from the browser — acceptable for demo/MVP.
// Before going to production, move this behind a backend proxy so the API key
// is never exposed in client-side code.

import { AGENTS } from '../config/agents.js'
import { knowledgeBase } from '../knowledge/index.js'

const STORAGE_KEY = 'srm_business_data_v1'

const SHARED_CONSTRAINTS = `
INSTRUCTIONS AND CONSTRAINTS:
- You work exclusively for Southern Ridge Farm and the Odom family. Never act outside this context.
- Always be concise. The owner is busy. Get to the point. 2–4 sentences unless more detail is clearly needed.
- When uncertain about a regulatory or legal detail, say so and name the right authority (TDA at 615-837-5100, IRS, CPA, or attorney).
- Never invent facts. If you don't know something specific about this farm, ask.
- Never recommend an irreversible financial or legal action without flagging it for owner review.
- Do not fabricate pricing, permit numbers, dates, or contact information not in the knowledge base.
- Respond in plain, direct English. No bullet-point overload. No corporate language.
- Today's date context: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`.trim()

function readBusinessData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatBusinessData(data) {
  if (!data) return ''

  const lines = ['CURRENT BUSINESS DATA (live from admin settings):']

  if (data.permits?.length) {
    lines.push('\nPermits & Licenses:')
    data.permits.forEach(p => {
      const exp = p.expiration
        ? `expires ${p.expiration} (${p.leadDays}d renewal lead)`
        : 'no expiration date set'
      lines.push(`  - ${p.name || 'Unnamed permit'}: ${exp}${p.notes ? ` — ${p.notes}` : ''}`)
    })
  }

  if (data.employees?.length) {
    const active = data.employees.filter(e => e.active)
    lines.push('\nEmployees (active):')
    active.forEach(e => {
      lines.push(`  - ${e.name || 'Unnamed'}: ${e.classification === 'farm' ? 'Farm / Form 943' : 'Retail / Form 941'}, $${Number(e.annualWages || 0).toLocaleString()}/yr`)
    })
    const farmWages = active.filter(e => e.classification === 'farm').reduce((s, e) => s + (Number(e.annualWages) || 0), 0)
    const retailWages = active.filter(e => e.classification === 'retail').reduce((s, e) => s + (Number(e.annualWages) || 0), 0)
    lines.push(`  Farm total (943): $${farmWages.toLocaleString()} | Retail total (941): $${retailWages.toLocaleString()}`)
  }

  if (data.compliance) {
    const c = data.compliance
    lines.push('\nCompliance Records:')
    if (c.haccpReviewDate) lines.push(`  - Last HACCP review: ${c.haccpReviewDate}`)
    if (c.herdshareCount)  lines.push(`  - Active herdshare customers: ${c.herdshareCount}`)
    if (c.tdaInspectionDate) lines.push(`  - TDA inspection: ${c.tdaInspectionDate}${c.tdaInspectionResult ? ` — ${c.tdaInspectionResult}` : ''}`)
    if (c.usdaInspectionDate) lines.push(`  - USDA inspection: ${c.usdaInspectionDate}${c.usdaInspectionResult ? ` — ${c.usdaInspectionResult}` : ''}`)
  }

  return lines.join('\n')
}

export function buildSystemPrompt(agentKey) {
  const agent = AGENTS[agentKey]
  if (!agent) return ''

  const knowledgeSections = (agent.knowledgeSources ?? [])
    .map(source => {
      const content = knowledgeBase[source]
      return content ? `--- ${source.toUpperCase()} ---\n${content.trim()}` : null
    })
    .filter(Boolean)
    .join('\n\n')

  const businessData = readBusinessData()
  const businessDataSection = formatBusinessData(businessData)

  return [
    `AGENT ROLE AND PERSONALITY:\n${agent.role}`,
    knowledgeSections ? `RELEVANT KNOWLEDGE:\n${knowledgeSections}` : null,
    businessDataSection ? businessDataSection : null,
    SHARED_CONSTRAINTS,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export async function sendMessage({ agentKey, history, userMessage }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set')
  }

  const systemPrompt = buildSystemPrompt(agentKey)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history,
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}
