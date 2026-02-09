import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'sunnybot.db')

let db: Database.Database

export function initDb(): Database.Database {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  db = new Database(DB_PATH)

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS instances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'creating',
      container_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_instances_user_id ON instances(user_id);
  `)

  return db
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return db
}

export interface Instance {
  id: string
  user_id: string
  name: string
  status: 'running' | 'stopped' | 'creating' | 'error'
  container_id: string | null
  created_at: string
  updated_at: string
}

export function getInstancesByUserId(userId: string): Instance[] {
  return getDb()
    .prepare('SELECT * FROM instances WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Instance[]
}

export function getInstanceById(id: string): Instance | undefined {
  return getDb()
    .prepare('SELECT * FROM instances WHERE id = ?')
    .get(id) as Instance | undefined
}

export function createInstance(
  id: string,
  userId: string,
  name: string
): Instance {
  getDb()
    .prepare(
      'INSERT INTO instances (id, user_id, name, status) VALUES (?, ?, ?, ?)'
    )
    .run(id, userId, name, 'creating')

  return getInstanceById(id)!
}

export function updateInstanceStatus(
  id: string,
  status: Instance['status'],
  containerId?: string
): void {
  if (containerId) {
    getDb()
      .prepare(
        "UPDATE instances SET status = ?, container_id = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .run(status, containerId, id)
  } else {
    getDb()
      .prepare(
        "UPDATE instances SET status = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .run(status, id)
  }
}

export function deleteInstance(id: string): void {
  getDb().prepare('DELETE FROM instances WHERE id = ?').run(id)
}
