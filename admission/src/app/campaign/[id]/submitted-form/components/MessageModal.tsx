"use client";

import { useState } from "react";
import { sendMessage } from "@/lib/applicationListStorage";
import styles from "./Modals.module.css";

type MessageModalProps = {
  channel: "sms" | "email";
  submissionIds: string[];
  onClose: () => void;
  onSent: () => void;
};

// This app has no SMS/Email gateway, so "sending" records a real message
// log entry against each selected submission (visible on its Messages tab)
// instead of pretending to reach an external provider.
export default function MessageModal({
  channel,
  submissionIds,
  onClose,
  onSent,
}: MessageModalProps) {
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!body.trim()) return;
    for (const submissionId of submissionIds) {
      sendMessage(submissionId, channel, body.trim());
    }
    onSent();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>
          {channel === "sms" ? "Send SMS" : "Send Email"} — {submissionIds.length} selected
        </h3>

        <div className={styles.formRow}>
          <div className={styles.formLabel}>Message</div>
          <div className={styles.formField}>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className="navigationButton" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="navigationButton" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
