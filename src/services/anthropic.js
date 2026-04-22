// Anthropic API — replace mock replies with real Claude calls
import { AGENTS } from '../config/agents.js'
import { knowledgeBase } from '../knowledge/index.js'

const SHARED_CONSTRAINTS = `
INSTRUCTIONS AND CONSTRAINTS:
- You work exclusively for Southern Ridge Farm and the Odom family. Never act outside this context.
- Always be concise. The owner is busy. Get to the point.
- When you are uncertain about a regulatory or legal detail, say so and recommend the owner verify with the appropriate authority (TDA, IRS, CPA, or attorney).
- Never invent facts about the farm. If you don't know something, ask.
- Never recommend taking an irreversible financial or legal action without flagging it for owner review.
- Do not make up pricing, permit numbers, dates, or contact information not provided in the knowledge base.
- If the owner pastes or uploads an image or document, extract what you can see and describe it clearly before proposing any action.
- Respond in plain, direct English. No bullet-point overload. No corporate language.
`.trim()

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

  return [
    `AGENT ROLE AND PERSONALITY:\n${agent.role}`,
    knowledgeSections ? `RELEVANT KNOWLEDGE:\n${knowledgeSections}` : null,
    SHARED_CONSTRAINTS,
  ]
    .filter(Boolean)
    .join('\n\n')
}

// --- LIVE API CALL (not yet active — replace mock timeout in ChatPanel) ---
//
// export async function chat({ agentKey, messages, userMessage }) {
//   const systemPrompt = buildSystemPrompt(agentKey)
//
//   const response = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
//       'anthropic-version': '2023-06-01',
//     },
//     body: JSON.stringify({
//       model: 'claude-sonnet-4-6',
//       max_tokens: 1024,
//       system: systemPrompt,
//       messages: [
//         ...messages.map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.text })),
//         { role: 'user', content: userMessage },
//       ],
//     }),
//   })
//
//   const data = await response.json()
//   return data.content[0].text
// }
