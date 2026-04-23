import { buildSystemPrompt } from './anthropic.js'

const API_URL = 'https://api.anthropic.com/v1/messages'

async function callAgent(agentKey, userMessage) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(agentKey),
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  return data.content[0].text
}

function makeId() {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function inferPlatform(prompt) {
  const lower = prompt.toLowerCase()
  if (lower.includes('newsletter') || lower.includes('email')) return 'Email'
  if (lower.includes('facebook')) return 'Facebook'
  return 'Instagram'
}

export async function generateStorytellerDraft(prompt, products = []) {
  let userMessage = prompt
  if (products.length) {
    const catalog = products
      .map(p => {
        const price = p.variants?.[0]?.price ?? '?'
        const inv = p.inventory_quantity ?? 0
        return `${p.title} — $${price} (${inv} in stock)`
      })
      .join('\n')
    userMessage = `${prompt}\n\nCurrent product catalog for reference:\n${catalog}`
  }

  const content = await callAgent('storyteller', userMessage)
  const platform = inferPlatform(prompt)

  return {
    id: makeId(),
    platform,
    title: prompt.length > 45 ? prompt.slice(0, 45) + '…' : prompt,
    meta: `${platform.toLowerCase()} · generated`,
    content,
    agentKey: 'storyteller',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}

export async function generateShepherdDraft(customer) {
  const name = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'valued customer'
  const days = customer.days_since_order ?? customer.daysSince ?? '?'
  const products = (customer.last_order_products ?? []).slice(0, 3).join(', ') || 'their previous order'

  const userMessage = `Write a re-engagement email for ${name}. They haven't ordered in ${days} days. Their last purchase included: ${products}. Keep it short — 3 to 5 sentences. Personal, not a template. End with a soft call to action.`

  const content = await callAgent('shepherd', userMessage)
  const firstName = name.split(' ')[0].toLowerCase()

  return {
    id: makeId(),
    platform: 'Email',
    title: `Re-engagement — ${name}`,
    meta: `email · re-engagement · ${firstName}`,
    content,
    agentKey: 'shepherd',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}

export async function generateHarvesterDraft(customerName, orderProducts = []) {
  const products = orderProducts.slice(0, 3).join(', ') || 'their recent order'
  const userMessage = `Write a review request for ${customerName}. They recently ordered: ${products}. Keep it 2 to 3 sentences. Personal, grateful, not pushy. Include a line about why reviews matter to a small farm.`

  const content = await callAgent('harvester', userMessage)
  const firstName = customerName.split(' ')[0].toLowerCase()

  return {
    id: makeId(),
    platform: 'Email',
    title: `Review request — ${customerName}`,
    meta: `email · review request · ${firstName}`,
    content,
    agentKey: 'harvester',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}
