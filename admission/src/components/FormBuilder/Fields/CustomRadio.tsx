"use client";

// Same pattern as CustomCheckbox.tsx: a static glyph for the builder's
// option-editing rows, and a fully interactive version for Preview.

import styles from "./CustomCheckbox.module.css"; // shared CSS with CustomCheckbox

interface RadioGlyphProps {
  checked?: boolean;
}

export function RadioGlyph({ checked = false }: RadioGlyphProps) {
  return (
    <span className={`${styles.circle} ${checked ? styles.circleChecked : ""}`}>
      {checked && <span className={styles.dot} />}
    </span>
  );
}

interface CustomRadioProps {
  checked: boolean;
  onChange?: () => void;
  label: string;
}

export default function CustomRadio({ checked, onChange, label }: CustomRadioProps) {
  return (
    <label className={styles.row} data-no-drag>
      <span
        className={`${styles.circle} ${checked ? styles.circleChecked : ""}`}
        onClick={onChange}
      >
        {checked && <span className={styles.dot} />}
      </span>
      <span className={styles.labelText}>{label}</span>
    </label>
  );
}