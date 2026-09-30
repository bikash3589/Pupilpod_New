export function generateId() {
  return crypto.randomUUID();
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}