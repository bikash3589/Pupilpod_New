"use client";

import { Fragment, useState } from "react";
import {
  getHistoryForSubmission,
  getMessagesForSubmission,
  isUrlValue,
} from "@/lib/applicationListStorage";
import type { ApplicationRow } from "@/types/applicationList";
import styles from "./Modals.module.css";

type RowDetailModalProps = {
  row: ApplicationRow;
  initialTab?: "details" | "history";
  onClose: () => void;
  onDelete: (row: ApplicationRow) => void;
};

// Read-only viewer combining what the legacy app splits across two modals —
// form_open.php's raw submission viewer and history.php's state-history
// timeline — since this app has no separate campaign_form_status screen to
// reuse from a companion module.
export default function RowDetailModal({
  row,
  initialTab = "details",
  onClose,
  onDelete,
}: RowDetailModalProps) {
  const [tab, setTab] = useState<"details" | "history" | "messages">(initialTab);
  const history = getHistoryForSubmission(row.submissionId);
  const messages = getMessagesForSubmission(row.submissionId);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Application {row.applicationId}</h3>

        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabButton} ${tab === "details" ? styles.tabButtonActive : ""}`}
            onClick={() => setTab("details")}
          >
            Details
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${tab === "history" ? styles.tabButtonActive : ""}`}
            onClick={() => setTab("history")}
          >
            History
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${tab === "messages" ? styles.tabButtonActive : ""}`}
            onClick={() => setTab("messages")}
          >
            Messages
          </button>
        </div>

        {tab === "details" && (
          <dl className={styles.detailGrid}>
            <dt>Status</dt>
            <dd>{row.wfStatus}</dd>
            <dt>Program</dt>
            <dd>{row.program ?? "—"}</dd>
            <dt>Class</dt>
            <dd>{row.yearGroup ?? "—"}</dd>
            {Object.entries(row.fields).map(([name, value]) => (
              <Fragment key={name}>
                <dt>{name}</dt>
                <dd>
                  {isUrlValue(value) ? (
                    <a href={value} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  ) : (
                    value || "—"
                  )}
                </dd>
              </Fragment>
            ))}
          </dl>
        )}

        {tab === "history" && (
          <>
            {history.length === 0 ? (
              <p>No state changes recorded yet — still at the initial &quot;Submitted&quot; state.</p>
            ) : (
              <ul className={styles.timeline}>
                {history.map((entry) => (
                  <li key={entry.id}>
                    <div className={styles.timelineState}>
                      {entry.displayName || entry.toState} → {entry.toState}
                    </div>
                    <div className={styles.timelineMeta}>
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.remark ? ` — "${entry.remark}"` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "messages" && (
          <>
            {messages.length === 0 ? (
              <p>No messages sent yet.</p>
            ) : (
              <ul className={styles.timeline}>
                {messages.map((m) => (
                  <li key={m.id}>
                    <div className={styles.timelineState}>
                      {m.channel === "sms" ? "SMS" : "Email"}
                    </div>
                    <div className={styles.timelineMeta}>
                      {new Date(m.createdAt).toLocaleString()} — {m.body}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.deleteAction}
            onClick={() => {
              onDelete(row);
              onClose();
            }}
          >
            Delete Applicant
          </button>
          <button type="button" className="navigationButton" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
