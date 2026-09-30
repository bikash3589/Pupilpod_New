"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import CampaignForm, {
  type CampaignFormValues,
} from "@/app/AddCampaign/components/CampaignForm";
import { upsertCampaign } from "@/lib/campaignStorage";
import {
  deleteDraftCampaign,
  getCampaignOrDraftById,
} from "@/lib/campaignDraftStorage";
import type { Campaign } from "@/types/campaign";
import styles from "@/app/AddCampaign/AddCampaign.module.css";

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // undefined = still loading from localStorage, null = no campaign with this id
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(
    undefined
  );
  const [saved, setSaved] = useState(false);
  const [formSaved, setFormSaved] = useState(false);

  useEffect(() => {
    setCampaign(getCampaignOrDraftById(id) ?? null);
  }, [id]);

  // Arriving here via "?formSaved=1" means the admin just came back from
  // building/editing this campaign's application form in the form
  // builder — surface that as an acknowledgement, then drop the param so
  // a later refresh of this page doesn't keep re-showing it.
  useEffect(() => {
    if (searchParams.get("formSaved") !== "1") return;
    setFormSaved(true);
    router.replace(`/campaign/${id}/edit`);
  }, [searchParams, router, id]);

  const handleSubmit = (values: CampaignFormValues) => {
    // Promotes a draft to a real campaign the first time this succeeds
    // (or just updates it, if it was already real) — this is the actual
    // "campaign creation complete" point: only from here on does it show
    // up on the Home page table.
    const updated = upsertCampaign(
      id,
      campaign?.createdAt ?? new Date().toISOString(),
      values
    );
    deleteDraftCampaign(id);
    setCampaign(updated);
    setSaved(true);
  };

  return (
    <main className="page">
      <header>
        <nav className="navigation">
          <Link href="/" className="navigationButton">
            Home
          </Link>
          <Link href="/" className="navigationButton">
            Admission
          </Link>
          <Link href="/MasterCampaign" className="navigationButton">
            Campaign
          </Link>
        </nav>
      </header>

      <h1 className="page-title">Edit Campaign</h1>

      {campaign === undefined && (
        <section className="application-container">
          <p>Loading campaign...</p>
        </section>
      )}

      {campaign === null && (
        <section className="application-container">
          <p>No campaign found for this id.</p>
          <Link href="/">Go to Home</Link>
        </section>
      )}

      {campaign && (
        <>
          {saved && (
            <div className={styles.successBanner}>
              Changes saved.
              <Link href="/">Go to Home</Link>
            </div>
          )}

          <CampaignForm
            initialValues={campaign}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            formJustSaved={formSaved}
          />
        </>
      )}
    </main>
  );
}
