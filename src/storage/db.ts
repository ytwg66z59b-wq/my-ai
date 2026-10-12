import type { AppState } from '../types/models'

const DB_NAME = 'dragon-days'
const DB_VERSION = 1
const STORE = 'app'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

export async function loadAppState(): Promise<AppState | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = store.get('state')
    req.onerror = () => reject(req.error ?? new Error('load failed'))
    req.onsuccess = () => {
      resolve((req.result as AppState | undefined) ?? null)
    }
    tx.oncomplete = () => db.close()
  })
}

export async function saveAppState(state: AppState): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.put(state, 'state')
    req.onerror = () => reject(req.error ?? new Error('save failed'))
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error ?? new Error('save tx failed'))
  })
}

export async function clearAppState(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete('state')
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error ?? new Error('clear failed'))
  })
}
