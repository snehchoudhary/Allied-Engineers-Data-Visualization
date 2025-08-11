// src/components/indexedDb.js
import { openDB } from 'idb';

const DB_NAME = 'ChunksChartsDB';
const STORE_NAME = 'files';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveToIndexedDB(key, data) {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, data, key);
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
  }
}

export async function loadFromIndexedDB(key) {
  try {
    const db = await getDB();
    return await db.get(STORE_NAME, key);
  } catch (err) {
    console.error('Error loading from IndexedDB:', err);
    return null;
  }
}

export async function deleteFromIndexedDB(key) {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, key);
  } catch (err) {
    console.error('Error deleting from IndexedDB:', err);
  }
}
