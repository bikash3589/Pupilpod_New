"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Builder from "@/components/FormBuilder/Builder/Builder";
import { getCampaignOrDraftById } from "@/lib/campaignDraftStorage";
import type { Campaign } from "@/types/campaign";

export default function CampaignFormBuilder() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  // Reached via the campaign form's own eye/edit buttons ("?from=edit")
  // → Back should return to finishing the campaign's other fields.
  // Reached via the "View Application Form" page's Edit button (no
  // param) → Back should return to that preview instead.
  const cameFromCampaignEdit = searchParams.get("from") === "edit";
  const backHref = cameFromCampaignEdit
    ? `/campaign/${id}/edit?formSaved=1`
    : `/campaign/${id}/view`;
  const backLabel = cameFromCampaignEdit
    ? "Back to Campaign"
    : "Back to Application Form";

  // undefined = still loading, null = no campaign with this id
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(
    undefined
  );

  useEffect(() => {
    setCampaign(getCampaignOrDraftById(id) ?? null);
  }, [id]);

  if (campaign === undefined) {
    return (
      <main className="page">
        <p>Loading campaign...</p>
      </main>
    );
  }

  if (campaign === null) {
    return (
      <main className="page">
        <p>No campaign found for this id.</p>
        <Link href="/">Go to Home</Link>
      </main>
    );
  }

  return (
    <Builder
      storageKey={`formbuilder-canvas-campaign-${id}`}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
