"use client";

// Two exports from this file:
//   - CheckboxGlyph: just the little square, no label, not interactive.
//     Used in the BUILDER's option-editing rows, replacing the old
//     plain native <input type="checkbox" disabled />.
//   - CustomCheckbox (default export): the glyph PLUS a clickable label,
//     fully interactive. Used by CheckboxGroupField in the live Preview.

import { Check } from "lucide-react";
import styles from "./CustomCheckbox.module.css";

interface CheckboxGlyphProps {
  checked?: boolean;
}

export function CheckboxGlyph({ checked = false }: CheckboxGlyphProps) {
  return (
    <span className={`${styles.box} ${checked ? styles.boxChecked : ""}`}>
      {checked && <Check size={12} className={styles.checkIcon} />}
    </span>
  );
}

interface CustomCheckboxProps {
  checked: boolean;
  onChange?: () => void;
  label: string;
}

export default function CustomCheckbox({ checked, onChange, label }: CustomCheckboxProps) {
  return (
    <label className={styles.row} data-no-drag>
      <span
        className={`${styles.box} ${checked ? styles.boxChecked : ""}`}
        onClick={onChange}
      >
        {checked && <Check size={12} className={styles.checkIcon} />}
      </span>
      <span className={styles.labelText}>{label}</span>
    </label>
  );
}