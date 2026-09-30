"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getCampaignById } from "@/lib/campaignStorage";
import { getTemplateFieldReference } from "@/lib/templateFieldReference";
import type { Campaign } from "@/types/campaign";
import type { TemplateFieldReference } from "@/types/uploadTemplate";
import styles from "../UploadTemplate.module.css";

export default function TemplateFieldsPage() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [fields, setFields] = useState<TemplateFieldReference[]>([]);

  useEffect(() => {
    setCampaign(getCampaignById(id) ?? null);
    setFields(getTemplateFieldReference(id));
  }, [id]);

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">
          Template Fields{campaign?.name ? ` — ${campaign.name}` : ""}
        </h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href={`/campaign/${id}/upload-template`}>
            Manage Application Form Template
          </Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>Template Fields</span>
        </nav>
      </div>

      <section className="application-container">
        <div className={styles.card}>
          <p className={styles.helpText}>
            Type these placeholders into your PDF template design so applicant
            data gets substituted in when the template is generated.
          </p>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Field Name</th>
                <th>Template Field Placeholder</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.emptyCell}>
                    No fields found. Build the application form for this
                    campaign first.
                  </td>
                </tr>
              ) : (
                fields.map((f, i) => (
                  <tr key={f.fieldName}>
                    <td>{i + 1}</td>
                    <td>{f.label}</td>
                    <td>
                      <code>{f.placeholder}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
