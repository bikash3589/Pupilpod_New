import { getCampaignById } from "./campaignStorage";
import type { Campaign } from "@/types/campaign";

const DRAFT_STORAGE_KEY = "campaignDrafts";

// Campaigns that have had an application form started for them (via the
// eye/edit icons) but haven't had their own mandatory fields filled in and
// submitted yet. Kept in a separate localStorage key from the real
// "campaigns" list so an in-progress campaign never shows up on the Home
// page table until it's actually complete.
export function getDraftCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Campaign[]) : [];
  } catch (err) {
    console.error("Failed to read campaign drafts from localStorage", err);
    return [];
  }
}

export function getDraftCampaignById(id: string): Campaign | undefined {
  return getDraftCampaigns().find((c) => c.id === id);
}

export function saveDraftCampaign(campaign: Campaign): void {
  const others = getDraftCampaigns().filter((c) => c.id !== campaign.id);
  localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify([...others, campaign])
  );
}

export function deleteDraftCampaign(id: string): void {
  const updated = getDraftCampaigns().filter((c) => c.id !== id);
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
}

// Looks in the real campaigns list first, falling back to drafts — for
// pages reachable while a campaign is still mid-creation (edit, form
// builder, view), so they keep working before the campaign is complete.
export function getCampaignOrDraftById(id: string): Campaign | undefined {
  return getCampaignById(id) ?? getDraftCampaignById(id);
}
