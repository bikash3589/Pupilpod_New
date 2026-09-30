"use client";

import { FormEvent, useState } from "react";

import type { TemplateType } from "@/types/uploadTemplate";
import styles from "./TemplateForm.module.css";

type TemplateFormErrors = {
  type?: string;
  name?: string;
  file?: string;
};

type TemplateFormProps = {
  title?: string;
  // "" only makes sense in Add mode before the admin has picked a type.
  type: TemplateType | "";
  availableTypes: TemplateType[];
  // Edit mode: the slot being edited is fixed, so Type renders as read-only text.
  fixedType?: boolean;
  initialName?: string;
  onSubmit: (values: {
    type: TemplateType;
    name: string;
    file: File;
  }) => Promise<void> | void;
  submitLabel?: string;
};

export default function TemplateForm({
  title = "Add Application Form Template",
  type,
  availableTypes,
  fixedType = false,
  initialName = "",
  onSubmit,
  submitLabel = "Submit",
}: TemplateFormProps) {
  const [selectedType, setSelectedType] = useState<TemplateType | "">(type);
  const [name, setName] = useState(initialName);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<TemplateFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: TemplateFormErrors = {};
    if (!selectedType) nextErrors.type = "Template Type is required";
    if (!name.trim()) nextErrors.name = "Template Name is required";
    if (!file) {
      nextErrors.file = "Please select a template file";
    } else if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      // Replicates form_template_addProcess.php's ".pdf only" rejection,
      // as a form error instead of the legacy fatal die().
      nextErrors.file = "Only .pdf files are accepted";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        type: selectedType as TemplateType,
        name: name.trim(),
        file: file as File,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{title}</h2>

      <div className={styles.formGrid}>
        <label className={styles.label} htmlFor="templateType">
          Template Type <span className={styles.required}>*</span>
        </label>
        <div className={styles.control}>
          {fixedType ? (
            <input id="templateType" type="text" value={selectedType} disabled readOnly />
          ) : (
            <select
              id="templateType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TemplateType)}
            >
              <option value="">Select Type</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
          {errors.type && <p className={styles.error}>{errors.type}</p>}
        </div>

        <label className={styles.label} htmlFor="templateName">
          Template Name <span className={styles.required}>*</span>
        </label>
        <div className={styles.control}>
          <input
            id="templateName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        <label className={styles.label} htmlFor="templateFile">
          Template <span className={styles.required}>*</span>
        </label>
        <div className={styles.control}>
          <input
            id="templateFile"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {errors.file && <p className={styles.error}>{errors.file}</p>}
        </div>

        <div className={styles.note}>* denotes a required field</div>
        <div className={styles.control}>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
