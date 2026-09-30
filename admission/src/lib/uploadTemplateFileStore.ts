// PDF file bytes live in IndexedDB rather than localStorage — a single
// campaign's Online + Offline PDFs would otherwise burn through localStorage's
// ~5MB per-origin quota almost immediately (base64 also inflates size ~33%).
// Only the small metadata rows (name, key, filename) live in localStorage,
// via campaignTemplateStorage.ts.

const DB_NAME = "admission-templates";
const STORE_NAME = "files";

function openFileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putTemplateFile(key: string, file: File): Promise<void> {
  const db = await openFileDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Object URLs don't survive a page reload, so this is called fresh on every read.
export async function getTemplateFileObjectUrl(key: string): Promise<string | null> {
  const db = await openFileDb();
  const file = await new Promise<File | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as File | undefined);
    req.onerror = () => reject(req.error);
  });
  return file ? URL.createObjectURL(file) : null;
}

export async function deleteTemplateFile(key: string): Promise<void> {
  const db = await openFileDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
