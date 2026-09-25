// Native IndexedDB, two stores: `media` (posts/snaps/photos as Blobs) and `kv` (progress flags).
const dbp = new Promise((resolve, reject) => {
  const req = indexedDB.open('vyral', 1);
  req.onupgradeneeded = () => {
    req.result.createObjectStore('media', { keyPath: 'id' });
    req.result.createObjectStore('kv');
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

function run(store, mode, fn) {
  return dbp.then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        tx.oncomplete = () => resolve(req?.result);
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export const putMedia = (m) => run('media', 'readwrite', (s) => s.put(m));
export const allMedia = () => run('media', 'readonly', (s) => s.getAll());
export const deleteMedia = (id) => run('media', 'readwrite', (s) => s.delete(id));
export const getKV = (k) => run('kv', 'readonly', (s) => s.get(k));
export const setKV = (k, v) => run('kv', 'readwrite', (s) => s.put(v, k));
