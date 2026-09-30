import type { ButtonPermissionGrants } from "@/types/buttonPermission";

const STORAGE_KEY = "campaignButtonPermissions";

export function getButtonPermissions(): ButtonPermissionGrants {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ButtonPermissionGrants) : {};
  } catch (err) {
    console.error("Failed to read button permissions from localStorage", err);
    return {};
  }
}

// Full replace, mirroring the legacy PHP page's delete-all-for-module then
// re-insert-from-submitted-form semantics — the whole table is saved at once.
export function saveButtonPermissions(grants: ButtonPermissionGrants): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(grants));
}
