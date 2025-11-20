import React, { useEffect, useState } from 'react'
import { getHealth, getItems, addItem } from './api'

export default function App() {
  const [health, setHealth] = useState('...')
  const [items, setItems] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    getHealth().then(h => setHealth(h.status))
    refresh()
  }, [])

  async function refresh() {
    const data = await getItems()
    setItems(data)
  }

  async function onAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    await addItem(name.trim())
    setName('')
    refresh()
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Webapp (React)</h1>
      <p>Backend health: <strong>{health}</strong></p>

      <form onSubmit={onAdd} style={{ marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nouvel item"
          aria-label="Nouvel item"
        />
        <button type="submit" style={{ marginLeft: 8 }}>Ajouter</button>
      </form>

      <ul>
        {items.map(i => (
          <li key={i.id}>{i.name}</li>
        ))}
      </ul>
    </div>
  )
}
