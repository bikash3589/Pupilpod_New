"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import FormFill from "@/components/FormBuilder/Preview/FormFill";
import { getCampaignById } from "@/lib/campaignStorage";
import { createSubmission } from "@/lib/applicationListStorage";
import type { Campaign } from "@/types/campaign";
import styles from "./Apply.module.css";

// The actual "Apply" screen — opens the campaign's own designed
// application form (built in the form builder) and lets staff fill it in
// exactly as an applicant would, the same way the legacy
// online_formopen.php/offline_formopen.php modals open the real Fluent
// Form rather than a generic data-entry box.
export default function ApplyPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [program, setProgram] = useState("");
  const [yearGroup, setYearGroup] = useState("");

  useEffect(() => {
    const found = getCampaignById(id) ?? null;
    setCampaign(found);
    if (found) {
      setProgram(found.programs[0] ?? "");
      setYearGroup(found.classes[0] ?? "");
    }
  }, [id]);

  const handleSubmit = (values: Record<string, string>) => {
    if (!campaign) return;
    createSubmission(campaign.id, values, program || null, yearGroup || null);
    router.push(`/campaign/${campaign.id}/submitted-form`);
  };

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
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">Apply — {campaign.name}</h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/campaign/${campaign.id}/submitted-form`}>Submitted Form</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>Apply</span>
        </nav>
      </div>

      <section className="application-container">
        <div className={styles.programClassRow}>
          <label>
            Program
            <select value={program} onChange={(e) => setProgram(e.target.value)}>
              <option value="">Select Program</option>
              {campaign.programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            Class
            <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)}>
              <option value="">Select Class</option>
              {campaign.classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <FormFill
          storageKey={`formbuilder-canvas-campaign-${campaign.id}`}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}
