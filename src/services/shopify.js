const WORKER_URL = import.meta.env.VITE_WORKER_URL

export async function getRecentOrders(days = 30) {
  if (!WORKER_URL) throw new Error('VITE_WORKER_URL is not set')
  const res = await fetch(`${WORKER_URL}/shopify/orders?days=${days}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? `Worker error ${res.status}`)
  }
  return res.json()
}

export async function getProducts() {
  if (!WORKER_URL) throw new Error('VITE_WORKER_URL is not set')
  const res = await fetch(`${WORKER_URL}/shopify/products`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? `Worker error ${res.status}`)
  }
  return res.json()
}

export async function getAtRiskCustomers() {
  if (!WORKER_URL) throw new Error('VITE_WORKER_URL is not set')
  const res = await fetch(`${WORKER_URL}/shopify/customers/at-risk`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? `Worker error ${res.status}`)
  }
  return res.json()
}
