"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getCampaignById } from "@/lib/campaignStorage";
import {
  getCampaignTemplates,
  uploadCampaignTemplate,
} from "@/lib/campaignTemplateStorage";
import type { Campaign } from "@/types/campaign";
import type { CampaignTemplate, TemplateType } from "@/types/uploadTemplate";
import TemplateForm from "../components/TemplateForm";
import styles from "../UploadTemplate.module.css";

function isTemplateType(value: string | null): value is TemplateType {
  return value === "Online" || value === "Offline";
}

export default function EditCampaignTemplate() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type = isTemplateType(typeParam) ? typeParam : null;

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  // undefined = loading, null = no template exists for this type
  const [existing, setExisting] = useState<CampaignTemplate | null | undefined>(
    undefined
  );

  useEffect(() => {
    setCampaign(getCampaignById(id) ?? null);

    if (!type) {
      setExisting(null);
      return;
    }
    getCampaignTemplates(id).then(({ online, offline }) => {
      const template = type === "Online" ? online : offline;
      setExisting(template.name ? template : null);
    });
  }, [id, type]);

  const handleSubmit = async (values: {
    type: TemplateType;
    name: string;
    file: File;
  }) => {
    await uploadCampaignTemplate({ campaignId: id, ...values });
    router.push(`/campaign/${id}/upload-template`);
  };

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">
          Edit Application Form Template
          {campaign?.name ? ` — ${campaign.name}` : ""}
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
          <span className={styles.breadcrumbCurrent}>Edit</span>
        </nav>
      </div>

      {existing === undefined && (
        <section className="application-container">
          <div className={styles.card}>
            <p>Loading...</p>
          </div>
        </section>
      )}

      {existing === null && (
        <section className="application-container">
          <div className={styles.card}>
            <p>
              No {type ?? ""} template found for this campaign.{" "}
              <Link href={`/campaign/${id}/upload-template`}>
                Back to Application Form Template
              </Link>
            </p>
          </div>
        </section>
      )}

      {existing && type && (
        <section className="application-container">
          <div className={styles.card}>
            <TemplateForm
              title="Edit Application Form Template"
              type={type}
              availableTypes={[type]}
              fixedType
              initialName={existing.name ?? ""}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
            />
          </div>
        </section>
      )}
    </main>
  );
}
