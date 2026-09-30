"use client";

import { useState } from "react";
import { updateSubmissionProgramClass } from "@/lib/applicationListStorage";
import type { Campaign } from "@/types/campaign";
import type { ApplicationRow } from "@/types/applicationList";
import styles from "./Modals.module.css";

type UpdateProgramClassModalProps = {
  campaign: Campaign;
  row: ApplicationRow;
  onClose: () => void;
  onUpdated: () => void;
};

export default function UpdateProgramClassModal({
  campaign,
  row,
  onClose,
  onUpdated,
}: UpdateProgramClassModalProps) {
  const [program, setProgram] = useState(row.program ?? "");
  const [yearGroup, setYearGroup] = useState(row.yearGroup ?? "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!program) {
      setError("You Have to Select Program!");
      return;
    }
    if (!yearGroup) {
      setError("You Have to Select Class!");
      return;
    }
    updateSubmissionProgramClass(row.submissionId, program, yearGroup);
    onUpdated();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Update Program &amp; Class</h3>

        <div className={styles.formRow}>
          <div className={styles.formLabel}>Program *</div>
          <div className={styles.formField}>
            <select value={program} onChange={(e) => setProgram(e.target.value)}>
              <option value="">Select Program</option>
              {campaign.programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formLabel}>Class *</div>
          <div className={styles.formField}>
            <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)}>
              <option value="">Select Class</option>
              {campaign.classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className="navigationButton" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="navigationButton" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
