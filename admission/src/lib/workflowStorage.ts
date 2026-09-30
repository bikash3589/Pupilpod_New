import type { Workflow } from "@/types/workflow";

const STORAGE_KEY = "workflows";

export function getWorkflows(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Workflow[]) : [];
  } catch (err) {
    console.error("Failed to read workflows from localStorage", err);
    return [];
  }
}

export function getWorkflowsByCampaign(campaignId: string): Workflow[] {
  return getWorkflows().filter((w) => w.campaignId === campaignId);
}

export function getWorkflowById(id: string): Workflow | undefined {
  return getWorkflows().find((w) => w.id === id);
}

export function saveWorkflow(workflow: Workflow): void {
  const existing = getWorkflows();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, workflow]));
}

export function updateWorkflow(
  id: string,
  updates: Omit<Workflow, "id" | "createdAt" | "campaignId">
): Workflow | undefined {
  const workflows = getWorkflows();
  const index = workflows.findIndex((w) => w.id === id);
  if (index === -1) return undefined;

  const updated: Workflow = { ...workflows[index], ...updates };
  workflows[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  return updated;
}

export function deleteWorkflow(id: string): void {
  const updated = getWorkflows().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
