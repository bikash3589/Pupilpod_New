"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./AddCampaign.module.css";
import CampaignForm, {
  type CampaignFormValues,
} from "./components/CampaignForm";

import { saveCampaign } from "@/lib/campaignStorage";
import type { Campaign } from "@/types/campaign";

export default function AddCampaign() {
  const [submitted, setSubmitted] = useState(false);
  // bumped after every successful add to remount CampaignForm with empty fields
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (values: CampaignFormValues) => {
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...values,
    };

    saveCampaign(campaign);
    setSubmitted(true);
    setFormKey((key) => key + 1);
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

      <h1 className="page-title">Add Campaign</h1>

      {submitted && (
        <div className={styles.successBanner}>
          Campaign created successfully.
          <button type="button" onClick={() => setSubmitted(false)}>
            Add another
          </button>
          <Link href="/">Go to Home</Link>
        </div>
      )}

      <CampaignForm key={formKey} onSubmit={handleSubmit} submitLabel="Submit" />
    </main>
  );
}
