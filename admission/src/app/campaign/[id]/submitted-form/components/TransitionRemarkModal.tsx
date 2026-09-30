"use client";

import { useState } from "react";
import type { AvailableTransitionButton } from "@/types/applicationList";
import styles from "./Modals.module.css";

type TransitionRemarkModalProps = {
  transition: AvailableTransitionButton;
  selectionCount: number;
  onClose: () => void;
  onConfirm: (remark: string) => void;
};

export default function TransitionRemarkModal({
  transition,
  selectionCount,
  onClose,
  onConfirm,
}: TransitionRemarkModalProps) {
  const [remark, setRemark] = useState("");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{transition.displayName}</h3>
        <p>
          Apply &quot;{transition.displayName}&quot; to {selectionCount} selected
          application{selectionCount === 1 ? "" : "s"}?
        </p>

        <div className={styles.formRow}>
          <div className={styles.formLabel}>Remark</div>
          <div className={styles.formField}>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className="navigationButton" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="navigationButton"
            onClick={() => onConfirm(remark)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
