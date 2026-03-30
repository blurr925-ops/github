import { openDB } from 'idb';
import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'tennis-toolkit-photos';
const STORE_NAME = 'photos';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date');
        store.createIndex('eventName', 'eventName');
      }
    },
  });
}

export function usePhotoDB() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = useCallback(async () => {
    const db = await getDB();
    const allPhotos = await db.getAll(STORE_NAME);
    allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPhotos(allPhotos);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const addPhoto = useCallback(async (photo) => {
    const db = await getDB();
    await db.put(STORE_NAME, photo);
    await loadPhotos();
  }, [loadPhotos]);

  const deletePhoto = useCallback(async (id) => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    await loadPhotos();
  }, [loadPhotos]);

  return { photos, loading, addPhoto, deletePhoto, refresh: loadPhotos };
}
