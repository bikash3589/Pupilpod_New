"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

import { getCampaignById } from "@/lib/campaignStorage";
import { registerInterest } from "@/lib/registeredUserStorage";
import type { Campaign } from "@/types/campaign";
import styles from "./Register.module.css";

// The public lead-capture page (cms/register.php equivalent) — a
// prospective parent lands here from the school's marketing site to
// register interest in one campaign, before filling the full application.
// This app has no separate public-site route group, so it's just a plain
// page reachable directly by URL, outside the admin Registered User list.
export default function RegisterInterestPage() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCampaign(getCampaignById(id) ?? null);
  }, [id]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !mobile.trim()) {
      setError("Name, email and mobile are all required.");
      return;
    }

    try {
      registerInterest(id, name.trim(), email.trim(), mobile.trim());
      setSuccess(true); // mirrors register.php's reg_status=1 redirect
    } catch (err) {
      // "Email id already exists" — the campaign-agnostic uniqueness gate
      setError(err instanceof Error ? err.message : "Failed to register interest.");
    }
  };

  if (campaign === undefined) {
    return <main className={styles.page}><p>Loading campaign...</p></main>;
  }

  if (campaign === null) {
    return <main className={styles.page}><p>No campaign found for this id.</p></main>;
  }

  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1>Thanks for registering your interest!</h1>
          <p>We&apos;ll be in touch about {campaign.name} shortly.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Register Your Interest</h1>
        <p className={styles.subtitle}>{campaign.name}</p>

        {error && <p className={styles.error}>{error}</p>}

        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Mobile
          <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </label>

        <button type="submit" className="navigationButton">
          Register
        </button>
      </form>
    </main>
  );
}
