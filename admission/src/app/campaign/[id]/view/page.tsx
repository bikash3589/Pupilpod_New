"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import FormPreview from "@/components/FormBuilder/Preview/FormPreview";
import { getCampaignOrDraftById } from "@/lib/campaignDraftStorage";
import type { Campaign } from "@/types/campaign";
import styles from "./View.module.css";

export default function ViewApplicationForm() {
  const { id } = useParams<{ id: string }>();

  // undefined = still loading, null = no campaign with this id
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(
    undefined
  );

  useEffect(() => {
    setCampaign(getCampaignOrDraftById(id) ?? null);
  }, [id]);

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">
          View Application Form{campaign ? ` — ${campaign.name}` : ""}
        </h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href="/">Campaign</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>
            View Application Form
          </span>
        </nav>
      </div>

      {campaign === undefined && (
        <section className="application-container">
          <div className={styles.card}>
            <p>Loading campaign...</p>
          </div>
        </section>
      )}

      {campaign === null && (
        <section className="application-container">
          <div className={styles.card}>
            <p>No campaign found for this id.</p>
            <Link href="/">Go to Home</Link>
          </div>
        </section>
      )}

      {campaign && (
        <section className="application-container">
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardHeaderTitle}>Application Form Preview</h2>
              <Link
                href={`/campaign/${id}/form-builder`}
                className={styles.editButton}
              >
                Edit Application Form
              </Link>
            </div>

            <div className={styles.previewFrame}>
              <FormPreview storageKey={`formbuilder-canvas-campaign-${id}`} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
