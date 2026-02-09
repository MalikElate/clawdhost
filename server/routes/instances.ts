import { Router } from 'express'
import { getAuth } from '@clerk/express'
import { v4 as uuidv4 } from 'uuid'
import {
  getInstancesByUserId,
  getInstanceById,
  createInstance as dbCreateInstance,
  updateInstanceStatus,
  deleteInstance as dbDeleteInstance,
} from '../db/sqlite.js'
import { createContainer, removeContainer } from '../services/docker.js'

const router = Router()

// List instances for authenticated user
router.get('/', (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const instances = getInstancesByUserId(userId)
  res.json(
    instances.map((i: any) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      createdAt: i.created_at,
    }))
  )
})

// Create new instance
router.post('/', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { name } = req.body
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' })
  }

  const id = uuidv4()
  const instance = dbCreateInstance(id, userId, name)

  // Create container in background
  createContainer(id, name)
    .then((containerId: string) => {
      updateInstanceStatus(id, 'running', containerId)
    })
    .catch((error: any) => {
      console.error('Failed to create container:', error)
      updateInstanceStatus(id, 'error')
    })

  res.status(201).json({
    id: instance.id,
    name: instance.name,
    status: instance.status,
    createdAt: instance.created_at,
  })
})

// Get instance status
router.get('/:id/status', (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const instance = getInstanceById(req.params.id)
  if (!instance || instance.user_id !== userId) {
    return res.status(404).json({ error: 'Instance not found' })
  }

  res.json({
    id: instance.id,
    name: instance.name,
    status: instance.status,
    createdAt: instance.created_at,
  })
})

// Delete instance
router.delete('/:id', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const instance = getInstanceById(req.params.id)
  if (!instance || instance.user_id !== userId) {
    return res.status(404).json({ error: 'Instance not found' })
  }

  try {
    if (instance.container_id) {
      await removeContainer(instance.container_id)
    }
    dbDeleteInstance(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    console.error('Failed to delete instance:', error)
    res.status(500).json({ error: 'Failed to delete instance' })
  }
})

export default router
