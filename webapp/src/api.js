const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/health`)
  return res.json()
}

export async function getItems() {
  const res = await fetch(`${API_BASE}/api/items`)
  return res.json()
}

export async function addItem(name) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  return res.json()
}
