import Docker from 'dockerode'

// Mock mode for local development without Docker
const MOCK_DOCKER = process.env.MOCK_DOCKER === 'true'

// In-memory storage for mock containers
const mockContainers = new Map<string, {
  id: string
  name: string
  status: 'running' | 'stopped'
  port: number
}>()

// Connect to Docker daemon
// In production, this will connect to the Oracle Cloud VM via SSH
let docker: Docker | null = null
if (!MOCK_DOCKER) {
  docker = new Docker({
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
  })
}

const MOLTBOT_IMAGE = 'moltbot/moltbot:latest'

function generateMockPort(): number {
  // Generate port between 3100-3999 for mock containers
  return 3100 + Math.floor(Math.random() * 900)
}

export async function createContainer(
  instanceId: string,
  name: string
): Promise<string> {
  if (MOCK_DOCKER) {
    // Mock container creation for local development
    console.log(`[MOCK] Creating container for instance: ${instanceId}`)
    const mockContainerId = `mock-${instanceId}`
    mockContainers.set(mockContainerId, {
      id: mockContainerId,
      name: `sunnybot-${instanceId}`,
      status: 'running',
      port: generateMockPort(),
    })
    return mockContainerId
  }

  if (!docker) {
    throw new Error('Docker not initialized')
  }

  // Pull image if not exists
  try {
    await docker.getImage(MOLTBOT_IMAGE).inspect()
  } catch {
    console.log(`Pulling ${MOLTBOT_IMAGE}...`)
    await new Promise((resolve, reject) => {
      docker!.pull(MOLTBOT_IMAGE, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err)
        docker!.modem.followProgress(stream, (err: Error | null) => {
          if (err) return reject(err)
          resolve(null)
        })
      })
    })
  }

  // Create container
  const container = await docker.createContainer({
    Image: MOLTBOT_IMAGE,
    name: `sunnybot-${instanceId}`,
    Labels: {
      'sunnybot.instance-id': instanceId,
      'sunnybot.name': name,
    },
    Env: [
      `INSTANCE_ID=${instanceId}`,
      // Add more environment variables as needed
    ],
    ExposedPorts: {
      '3000/tcp': {},
    },
    HostConfig: {
      PortBindings: {
        '3000/tcp': [{ HostPort: '0' }], // Dynamic port
      },
      RestartPolicy: {
        Name: 'unless-stopped',
      },
    },
  })

  await container.start()
  return container.id
}

export async function removeContainer(containerId: string): Promise<void> {
  if (MOCK_DOCKER) {
    console.log(`[MOCK] Removing container: ${containerId}`)
    mockContainers.delete(containerId)
    return
  }

  if (!docker) {
    throw new Error('Docker not initialized')
  }

  const container = docker.getContainer(containerId)
  try {
    await container.stop()
  } catch {
    // Container might already be stopped
  }
  await container.remove()
}

export async function getContainerPort(containerId: string): Promise<number> {
  if (MOCK_DOCKER) {
    const mockContainer = mockContainers.get(containerId)
    if (!mockContainer) {
      throw new Error('Mock container not found')
    }
    return mockContainer.port
  }

  if (!docker) {
    throw new Error('Docker not initialized')
  }

  const container = docker.getContainer(containerId)
  const info = await container.inspect()
  const portBindings = info.NetworkSettings.Ports['3000/tcp']
  if (!portBindings || portBindings.length === 0) {
    throw new Error('No port binding found')
  }
  return parseInt(portBindings[0].HostPort, 10)
}

export async function getContainerStatus(
  containerId: string
): Promise<'running' | 'stopped' | 'error'> {
  if (MOCK_DOCKER) {
    const mockContainer = mockContainers.get(containerId)
    if (!mockContainer) {
      return 'error'
    }
    return mockContainer.status
  }

  if (!docker) {
    return 'error'
  }

  try {
    const container = docker.getContainer(containerId)
    const info = await container.inspect()
    return info.State.Running ? 'running' : 'stopped'
  } catch {
    return 'error'
  }
}
