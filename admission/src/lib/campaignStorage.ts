import type { Campaign } from "@/types/campaign";

const STORAGE_KEY = "campaigns";

export function getCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Campaign[]) : [];
  } catch (err) {
    console.error("Failed to read campaigns from localStorage", err);
    return [];
  }
}

export function saveCampaign(campaign: Campaign): void {
  const existing = getCampaigns();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, campaign]));
}

export function getCampaignById(id: string): Campaign | undefined {
  return getCampaigns().find((c) => c.id === id);
}

export function updateCampaign(
  id: string,
  updates: Omit<Campaign, "id" | "createdAt">
): Campaign | undefined {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updated: Campaign = { ...campaigns[index], ...updates };
  campaigns[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  return updated;
}

export function deleteCampaign(id: string): void {
  const updated = getCampaigns().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Updates the campaign at `id` if it's already a real (completed) campaign,
// otherwise inserts it as a new one under that same id — used when a draft
// (see campaignDraftStorage) is being promoted to a real campaign for the
// first time on final Submit.
export function upsertCampaign(
  id: string,
  createdAt: string,
  updates: Omit<Campaign, "id" | "createdAt">
): Campaign {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);

  if (index === -1) {
    const campaign: Campaign = { id, createdAt, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...campaigns, campaign]));
    return campaign;
  }

  const updated: Campaign = { ...campaigns[index], ...updates };
  campaigns[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  return updated;
}