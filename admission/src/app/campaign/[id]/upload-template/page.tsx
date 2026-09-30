"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  deleteCampaignTemplate,
  getCampaignTemplates,
  listImageFieldCoordinates,
  uploadCampaignTemplate,
} from "@/lib/campaignTemplateStorage";
import {
  PHOTO_FIELDS,
  type CampaignTemplate,
  type ImageFieldCoordinates,
  type PhotoFieldName,
  type TemplateType,
} from "@/types/uploadTemplate";
import ImageFieldConfigModal from "./components/ImageFieldConfigModal";
import TemplateForm from "./components/TemplateForm";
import styles from "./UploadTemplate.module.css";

export default function UploadTemplateManage() {
  const { id } = useParams<{ id: string }>();

  const [online, setOnline] = useState<CampaignTemplate | null>(null);
  const [offline, setOffline] = useState<CampaignTemplate | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [coordTemplateType, setCoordTemplateType] = useState<TemplateType | "">("");
  const [coordRows, setCoordRows] = useState<ImageFieldCoordinates[]>([]);
  const [activeField, setActiveField] = useState<PhotoFieldName | null>(null);

  const refreshTemplates = useCallback(async () => {
    const templates = await getCampaignTemplates(id);
    setOnline(templates.online);
    setOffline(templates.offline);
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    refreshTemplates();
  }, [id, refreshTemplates]);

  const refreshCoords = useCallback(() => {
    if (!coordTemplateType) {
      setCoordRows([]);
      return;
    }
    setCoordRows(listImageFieldCoordinates(id, coordTemplateType));
  }, [id, coordTemplateType]);

  useEffect(() => {
    refreshCoords();
  }, [refreshCoords]);

  const existingTemplates = [online, offline].filter(
    (t): t is CampaignTemplate => Boolean(t?.name)
  );
  const availableTypes: TemplateType[] = [
    ...(online?.name ? [] : (["Online"] as TemplateType[])),
    ...(offline?.name ? [] : (["Offline"] as TemplateType[])),
  ];

  const handleDeleteTemplate = async (type: TemplateType) => {
    if (!window.confirm(`Delete the ${type} template?`)) return;
    await deleteCampaignTemplate(id, type);
    await refreshTemplates();
  };

  const handleAddTemplate = async (values: {
    type: TemplateType;
    name: string;
    file: File;
  }) => {
    await uploadCampaignTemplate({ campaignId: id, ...values });
    await refreshTemplates();
  };

  const openSetParameter = (field: PhotoFieldName) => {
    if (!coordTemplateType) {
      // Replicates campaign_template_configure_image.php's client-side
      // alert() gate — coordinates are always scoped to one template type.
      window.alert("Please Select Template Type");
      return;
    }
    setActiveField(field);
  };

  const coordByField = (field: PhotoFieldName) =>
    coordRows.find((r) => r.fieldName === field);

  const pageTitle =
    loaded && availableTypes.length > 0
      ? "Add Application Form Template"
      : "Manage Application Form Template";

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">{pageTitle}</h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href="/">Campaign</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>
            Manage Application Form Template
          </span>
        </nav>
      </div>

      <section className="application-container">
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <Link
              href={`/campaign/${id}/upload-template/fields`}
              className="navigationButton"
            >
              Template Fields
            </Link>
          </div>

          {loaded && existingTemplates.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Template Type</th>
                  <th>Template Name</th>
                  <th>Template File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {existingTemplates.map((template) => (
                  <tr key={template.type}>
                    <td>{template.type}</td>
                    <td>{template.name}</td>
                    <td>
                      {template.fileUrl ? (
                        <a
                          href={template.fileUrl}
                          download={template.fileName ?? undefined}
                        >
                          {template.fileName}
                        </a>
                      ) : (
                        template.fileName
                      )}
                    </td>
                    <td>
                      <div className={styles.actionLinks}>
                        <Link
                          href={`/campaign/${id}/upload-template/edit?type=${template.type}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={styles.deleteAction}
                          onClick={() => handleDeleteTemplate(template.type)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {loaded && availableTypes.length > 0 && (
            <TemplateForm
              title="Add Application Form Template"
              type={availableTypes.length === 1 ? availableTypes[0] : ""}
              availableTypes={availableTypes}
              onSubmit={handleAddTemplate}
              submitLabel="Submit"
            />
          )}

          <h2 className={styles.sectionTitle}>Configure Image Fields</h2>

          <div className={styles.filterRow}>
            <label htmlFor="coordTemplateType">Template Type</label>
            <select
              id="coordTemplateType"
              value={coordTemplateType}
              onChange={(e) =>
                setCoordTemplateType(e.target.value as TemplateType | "")
              }
            >
              <option value="">Please Select Template Type</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Attribute Name</th>
                <th>X</th>
                <th>Y</th>
                <th>Page No</th>
                <th>Width</th>
                <th>Height</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {PHOTO_FIELDS.map((field, index) => {
                const coord = coordByField(field);
                return (
                  <tr key={field}>
                    <td>{index + 1}</td>
                    <td>{field}</td>
                    <td>{coord?.x ?? "—"}</td>
                    <td>{coord?.y ?? "—"}</td>
                    <td>{coord?.pageNo ?? "—"}</td>
                    <td>{coord?.width ?? "—"}</td>
                    <td>{coord?.height ?? "—"}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.setParameterButton}
                        onClick={() => openSetParameter(field)}
                      >
                        Set Parameter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {activeField && (
        <ImageFieldConfigModal
          campaignId={id}
          fieldName={activeField}
          initialTemplateType={coordTemplateType}
          onClose={() => setActiveField(null)}
          onSaved={refreshCoords}
        />
      )}
    </main>
  );
}
