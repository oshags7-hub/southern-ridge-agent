// Anthropic API
// NOTE: This calls the API directly from the browser — acceptable for demo/MVP.
// Before going to production, move this behind a backend proxy so the API key
// is never exposed in client-side code.

import { AGENTS } from '../config/agents.js'
import { knowledgeBase } from '../knowledge/index.js'
import { getRecentOrders, getProducts, getAtRiskCustomers } from './shopify.js'

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

function formatOrders(orders) {
  if (!orders?.length) return 'No orders found for this period.'
  const total = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0)
  const lines = [
    `${orders.length} orders | Total revenue: $${total.toFixed(2)}`,
    '',
    ...orders.slice(0, 20).map(o => {
      const items = o.line_items.map(li => `${li.quantity}x ${li.title}`).join(', ')
      return `  ${o.created_at.slice(0, 10)} | ${o.customer_name} | $${o.total_price} | ${items}`
    }),
  ]
  if (orders.length > 20) lines.push(`  ... and ${orders.length - 20} more orders`)
  return lines.join('\n')
}

function formatProducts(products) {
  if (!products?.length) return 'No active products found.'
  return products
    .map(p => {
      const prices = p.variants.map(v => `$${v.price}`).join(' / ')
      const inv = p.inventory_quantity
      const invLabel = inv === 0 ? 'OUT OF STOCK' : inv < 5 ? `LOW (${inv})` : `${inv} in stock`
      return `  ${p.title} [${p.product_type || 'uncategorized'}] — ${prices} — ${invLabel}`
    })
    .join('\n')
}

function formatAtRiskCustomers(customers) {
  if (!customers?.length) return 'No at-risk customers found.'
  return customers
    .slice(0, 20)
    .map(c => {
      const name = `${c.first_name} ${c.last_name}`.trim()
      const days = c.days_since_order != null ? `${c.days_since_order} days ago` : 'unknown'
      const products = c.last_order_products.slice(0, 3).join(', ')
      return `  ${name} | Last order: ${days} | ${c.total_orders} total orders | Last bought: ${products || 'unknown'}`
    })
    .join('\n')
}

export function buildSystemPrompt(agentKey, shopifyContext = null) {
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

  const shopifySection = shopifyContext
    ? Object.entries(shopifyContext)
        .map(([k, v]) => v)
        .join('\n\n')
    : null

  return [
    `AGENT ROLE AND PERSONALITY:\n${agent.role}`,
    knowledgeSections ? `RELEVANT KNOWLEDGE:\n${knowledgeSections}` : null,
    businessDataSection ? businessDataSection : null,
    shopifySection ? shopifySection : null,
    SHARED_CONSTRAINTS,
  ]
    .filter(Boolean)
    .join('\n\n')
}

// Returns true if this agent fetches Shopify data before sending
export function agentNeedsShopifyData(agentKey) {
  return ['bookkeeper', 'shepherd', 'storyteller'].includes(agentKey)
}

// Fetches the Shopify data sections relevant to the given agent.
// Returns an object of labeled sections, or null if Shopify is not configured.
export async function fetchShopifyContext(agentKey) {
  if (!import.meta.env.VITE_WORKER_URL) return null

  const context = {}
  try {
    if (agentKey === 'bookkeeper') {
      const orders = await getRecentOrders(30)
      context.orders = `RECENT SALES DATA (last 30 days):\n${formatOrders(orders)}`
    }
    if (agentKey === 'shepherd') {
      const customers = await getAtRiskCustomers()
      context.atRisk = `CUSTOMERS NEEDING ATTENTION (no order in 90+ days):\n${formatAtRiskCustomers(customers)}`
    }
    if (agentKey === 'storyteller') {
      const products = await getProducts()
      context.products = `CURRENT PRODUCT CATALOG:\n${formatProducts(products)}`
    }
  } catch {
    // Shopify data is best-effort — don't block the agent if it fails
  }

  return Object.keys(context).length ? context : null
}

export async function sendMessage({ agentKey, history, userMessage }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set')
  }

  const shopifyContext = agentNeedsShopifyData(agentKey)
    ? await fetchShopifyContext(agentKey)
    : null

  const systemPrompt = buildSystemPrompt(agentKey, shopifyContext)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
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
