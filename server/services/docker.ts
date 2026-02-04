import Docker from 'dockerode'

// Connect to Docker daemon
// In production, this will connect to the Oracle Cloud VM via SSH
const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
})

const MOLTBOT_IMAGE = 'moltbot/moltbot:latest'

export async function createContainer(
  instanceId: string,
  name: string
): Promise<string> {
  // Pull image if not exists
  try {
    await docker.getImage(MOLTBOT_IMAGE).inspect()
  } catch {
    console.log(`Pulling ${MOLTBOT_IMAGE}...`)
    await new Promise((resolve, reject) => {
      docker.pull(MOLTBOT_IMAGE, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err)
        docker.modem.followProgress(stream, (err: Error | null) => {
          if (err) return reject(err)
          resolve(null)
        })
      })
    })
  }

  // Create container
  const container = await docker.createContainer({
    Image: MOLTBOT_IMAGE,
    name: `clawdhost-${instanceId}`,
    Labels: {
      'clawdhost.instance-id': instanceId,
      'clawdhost.name': name,
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
  const container = docker.getContainer(containerId)
  try {
    await container.stop()
  } catch {
    // Container might already be stopped
  }
  await container.remove()
}

export async function getContainerPort(containerId: string): Promise<number> {
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
  try {
    const container = docker.getContainer(containerId)
    const info = await container.inspect()
    return info.State.Running ? 'running' : 'stopped'
  } catch {
    return 'error'
  }
}
