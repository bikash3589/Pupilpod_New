"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  deleteCampaignSeries,
  getCampaignSeriesList,
} from "@/lib/campaignSeriesStorage";
import type { CampaignSeriesListRow } from "@/types/campaignSeries";
import styles from "./MasterCampaign.module.css";

export default function MasterCampaign() {
  const [rows, setRows] = useState<CampaignSeriesListRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRows(getCampaignSeriesList());
    setLoaded(true);
  }, []);

  const handleDelete = (row: CampaignSeriesListRow) => {
    if (!row.isDeletable) {
      alert("This Fee Series is Already in Use");
      return;
    }
    if (!confirm(`Delete series "${row.seriesName}"?`)) return;
    deleteCampaignSeries(row.id);
    setRows(getCampaignSeriesList());
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
      <h1 className="page-title">Master Campaign Series</h1>
      <div className="application-container">
        <div className={styles.toolbar}>
          <Link href="/MasterCampaign/CampaignSeries" className="navigationButton">
            Add
          </Link>
        </div>

        <div className={styles.tableWrap}>
          {!loaded ? (
            <p>Loading campaign series...</p>
          ) : rows.length === 0 ? (
            <p className={styles.empty}>
              No campaign series yet. Click &quot;Add&quot; to create one.
            </p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Series Name</th>
                  <th>Series Type</th>
                  <th>Format</th>
                  <th>Description</th>
                  <th>Academic Year</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.seriesName}</td>
                    <td>{row.type}</td>
                    <td>{row.format}</td>
                    <td>{row.description}</td>
                    <td>{row.academicYear}</td>
                    <td>
                      <div className={styles.actionLinks}>
                        <Link href={`/MasterCampaign/CampaignSeries/${row.id}/edit`}>
                          Edit
                        </Link>
                        <button type="button" onClick={() => handleDelete(row)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
