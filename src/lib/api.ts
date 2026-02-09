// Support environment-based API URL for cross-origin requests
// In production (Vercel), use VITE_API_URL from environment
// In development, fall back to same-origin /api path
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

export interface Instance {
  id: string
  name: string
  status: 'running' | 'stopped' | 'creating' | 'error'
  createdAt: string
}

export async function getInstances(): Promise<Instance[]> {
  const res = await fetch(`${API_BASE}/instances`)
  if (!res.ok) throw new Error('Failed to fetch instances')
  return res.json()
}

export async function createInstance(name: string): Promise<Instance> {
  const res = await fetch(`${API_BASE}/instances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create instance')
  return res.json()
}

export async function deleteInstance(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/instances/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete instance')
}

export async function getInstanceStatus(id: string): Promise<Instance> {
  const res = await fetch(`${API_BASE}/instances/${id}/status`)
  if (!res.ok) throw new Error('Failed to get instance status')
  return res.json()
}
