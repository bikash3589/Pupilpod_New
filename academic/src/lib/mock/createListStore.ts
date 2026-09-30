"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Bump this whenever any mock seed file's `initial*` data changes shape or content.
 * Every store's localStorage key is suffixed with this version, so a browser that already
 * cached an older seed (from a prior visit) starts fresh under the new key instead of
 * silently shadowing the updated mock data with stale, previously-persisted rows.
 */
const SEED_VERSION = 2;

/**
 * localStorage-backed reactive store for the frontend-only phase.
 *
 * Server-rendered snapshot is always the static seed data (`initial`) so SSR/hydration
 * never mismatches; once mounted on the client, `hydrate()` swaps in whatever is in
 * localStorage under `storageKey` (if anything) and every mutation after that is
 * persisted back to localStorage automatically.
 *
 * Call sites (`.add`/`.update`/`.remove`/`useListStore`, etc.) are storage-agnostic —
 * swapping this out for real API/DB calls later means changing this file only.
 */
export function createListStore<T extends { id: number }>(storageKeyBase: string, initial: T[]) {
  const storageKey = `${storageKeyBase}.v${SEED_VERSION}`;
  let items = initial;
  const listeners = new Set<() => void>();
  let hydrated = false;

  function notify() {
    listeners.forEach((l) => l());
  }

  function persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // localStorage unavailable (private mode, quota, etc.) — in-memory state still works.
    }
  }

  function hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          items = parsed as T[];
          notify();
          return;
        }
      }
    } catch {
      // fall through to seeding below
    }
    persist();
  }

  return {
    storageKey,
    getSnapshot: () => items,
    getServerSnapshot: () => initial,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrate,
    getById: (id: number) => items.find((i) => i.id === id),
    add: (item: T) => {
      items = [...items, item];
      persist();
      notify();
    },
    update: (id: number, patch: Partial<T>) => {
      items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
      persist();
      notify();
    },
    replace: (id: number, item: T) => {
      items = items.map((i) => (i.id === id ? item : i));
      persist();
      notify();
    },
    remove: (id: number) => {
      items = items.filter((i) => i.id !== id);
      persist();
      notify();
    },
    removeMany: (ids: number[]) => {
      const idSet = new Set(ids);
      items = items.filter((i) => !idSet.has(i.id));
      persist();
      notify();
    },
    setAll: (next: T[]) => {
      items = next;
      persist();
      notify();
    },
  };
}

export type ListStore<T extends { id: number }> = ReturnType<typeof createListStore<T>>;

export function useListStore<T extends { id: number }>(store: ListStore<T>): T[] {
  useEffect(() => {
    store.hydrate();
  }, [store]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
