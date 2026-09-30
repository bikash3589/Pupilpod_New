"use client";

import { useState } from "react";
import { sendRegisteredUserMessage } from "@/lib/registeredUserStorage";
import styles from "./Modals.module.css";

type SendMessageModalProps = {
  channel: "email" | "sms";
  registrationIds: string[];
  onClose: () => void;
  onSent: () => void;
};

export default function SendMessageModal({
  channel,
  registrationIds,
  onClose,
  onSent,
}: SendMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!body.trim()) return;
    // The subject is stored exactly as entered — never run through an
    // HTML-line-break transform the way the legacy code mistakenly does.
    sendRegisteredUserMessage(registrationIds, channel, body.trim(), subject.trim() || null);
    onSent();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>
          {channel === "email" ? "Send Email" : "Send SMS"} — {registrationIds.length} selected
        </h3>

        {channel === "email" && (
          <div className={styles.formRow}>
            <div className={styles.formLabel}>Subject</div>
            <div className={styles.formField}>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          </div>
        )}

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
