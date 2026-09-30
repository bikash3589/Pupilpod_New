"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "./CampaignSeries.module.css";
import SeriesFormatBuilder from "../components/SeriesFormatBuilder";
import { createCampaignSeries } from "@/lib/campaignSeriesStorage";
import type { CampaignSeriesType, DraftFormatBlock } from "@/types/campaignSeries";

export default function CreateCampaign() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];

  const [academicYear, setAcademicYear] = useState(academicYears[0]);
  const [seriesFor, setSeriesFor] = useState<CampaignSeriesType | "">("");
  const [seriesName, setSeriesName] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState<DraftFormatBlock[]>([]);

  const [seriesForError, setSeriesForError] = useState("");
  const [seriesNameError, setSeriesNameError] = useState("");
  const [blocksError, setBlocksError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleSeriesForBlur = () => {
    setSeriesForError(seriesFor ? "" : "Series For is required.");
  };

  const handleSeriesNameBlur = () => {
    setSeriesNameError(seriesName.trim() ? "" : "Series Name is required.");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const hasSeriesFor = Boolean(seriesFor);
    const hasSeriesName = Boolean(seriesName.trim());
    const hasBlocks = blocks.length > 0;

    setSeriesForError(hasSeriesFor ? "" : "Series For is required.");
    setSeriesNameError(hasSeriesName ? "" : "Series Name is required.");
    setBlocksError(hasBlocks ? "" : "Add at least one format block.");

    if (!hasSeriesFor || !hasSeriesName || !hasBlocks) return;

    try {
      createCampaignSeries({
        academicYear,
        type: seriesFor as CampaignSeriesType,
        seriesName: seriesName.trim(),
        description,
        blocks,
      });
      router.push("/MasterCampaign");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save the series.");
    }
  };

  return (
    <main className="page">
      <header>
        <nav className="navigation">
          <Link href="/" className="navigationButton">Home</Link>
          <Link href="/" className="navigationButton">Admission</Link>
          <Link href="/" className="navigationButton">Campaign</Link>
        </nav>
      </header>
      <h1 className="page-title">Add Campaign Series</h1>
      <form className={styles.applicationContainer} onSubmit={handleSubmit}>
        {/* Academic Year */}
        <div className={styles.formRow}>
          <div className={styles.formLabel}>Academic Year *</div>

          <div className={styles.formField}>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Series For */}
        <div className={styles.formRow}>
          <div className={styles.formLabel}>Series For *</div>

          <div className={styles.formField}>
            <select
              value={seriesFor}
              onChange={(e) => {
                setSeriesFor(e.target.value as CampaignSeriesType | "");
                setSeriesForError("");
              }}
              onBlur={handleSeriesForBlur}
            >
              <option value="">Select Type</option>
              <option value="Admission">Admission</option>
              <option value="Application">Application</option>
            </select>

            {seriesForError && <p className={styles.error}>{seriesForError}</p>}
          </div>
        </div>

        {/* Series Name */}
        <div className={styles.formRow}>
          <div className={styles.formLabel}>
            Series Name *
            <small>Must be unique.</small>
          </div>

          <div className={styles.formField}>
            <input
              type="text"
              value={seriesName}
              onChange={(e) => {
                setSeriesName(e.target.value);
                setSeriesNameError("");
              }}
              onBlur={handleSeriesNameBlur}
            />

            {seriesNameError && <p className={styles.error}>{seriesNameError}</p>}
          </div>
        </div>

        {/* Description */}
        <div className={styles.formRow}>
          <div className={styles.formLabel}>Description</div>

          <div className={styles.formField}>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Format */}
        <div className={styles.formRow}>
          <div className={styles.formLabel}>
            Format *
            <small>Built from the blocks below.</small>
          </div>

          <div className={styles.formField}>
            <SeriesFormatBuilder
              blocks={blocks}
              onChange={(next) => {
                setBlocks(next);
                setBlocksError("");
              }}
            />
            {blocksError && <p className={styles.error}>{blocksError}</p>}
          </div>
        </div>

        {submitError && <p className={styles.error}>{submitError}</p>}

        <div className={styles.formRow}>
          <div className={styles.formLabel}>* denotes a required field</div>
        </div>
        <button type="submit" className="navigationButton">
          Submit
        </button>
      </form>
    </main>
  );
}
