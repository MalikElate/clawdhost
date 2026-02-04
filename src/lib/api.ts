const API_BASE = '/api'

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
