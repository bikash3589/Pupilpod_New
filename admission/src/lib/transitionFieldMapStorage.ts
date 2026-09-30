import type {
  CreateFieldMappingInput,
  FieldMappingRow,
  UpdateFieldMappingInput,
} from "@/types/transitionFieldMap";

const STORAGE_KEY = "transitionFieldMaps";

export function getFieldMappings(): FieldMappingRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FieldMappingRow[]) : [];
  } catch (err) {
    console.error("Failed to read transition field mappings from localStorage", err);
    return [];
  }
}

export function getFieldMappingsByCampaign(campaignId: string): FieldMappingRow[] {
  return getFieldMappings().filter((row) => row.campaignId === campaignId);
}

export function getFieldMappingById(id: string): FieldMappingRow | undefined {
  return getFieldMappings().find((row) => row.id === id);
}

// Saves one or more repeatable-form rows at once, mirroring the legacy
// "Add More Transition" batch submit (transitionProcess.php).
export function createFieldMappings(
  rows: CreateFieldMappingInput[]
): FieldMappingRow[] {
  const existing = getFieldMappings();
  const now = new Date().toISOString();

  const created: FieldMappingRow[] = rows.map((row, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    ...row,
    createdAt: now,
    updatedAt: now,
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...created]));
  return created;
}

export function updateFieldMapping(
  id: string,
  updates: UpdateFieldMappingInput
): FieldMappingRow | undefined {
  const rows = getFieldMappings();
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return undefined;

  const updated: FieldMappingRow = {
    ...rows[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  rows[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  return updated;
}

export function deleteFieldMapping(id: string): void {
  const updated = getFieldMappings().filter((row) => row.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
