"use client";

// Self-contained email input with live validation feedback. Same pattern
// as DateField: manages its own value internally, takes simple props.

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import styles from "./EmailField.module.css";

interface EmailFieldProps {
  placeholder?: string;
  pattern?: string; // optional custom regex from Properties -> validation.pattern
  disabled?: boolean;
}

const DEFAULT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailField({ placeholder = "you@example.com", pattern, disabled = false }: EmailFieldProps) {
  const [value, setValue] = useState("");

  const regex = pattern ? new RegExp(pattern) : DEFAULT_EMAIL_REGEX;
  const isEmpty = value.trim() === "";
  const isValid = !isEmpty && regex.test(value);
  const isInvalid = !isEmpty && !isValid;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <input
          type="email"
          className={`${styles.input} ${isValid ? styles.valid : ""} ${isInvalid ? styles.invalid : ""} ${disabled ? styles.disabledInput : ""}`}
          placeholder={disabled ? placeholder : placeholder}
          value={disabled ? "" : value}
          onChange={disabled ? undefined : (event) => setValue(event.target.value)}
          readOnly={disabled}
          disabled={disabled}
          data-no-drag
        />
        {isValid && <CheckCircle2 size={16} className={styles.iconValid} />}
        {isInvalid && <XCircle size={16} className={styles.iconInvalid} />}
      </div>
      {isInvalid && <span className={styles.errorText}>Enter a valid email address</span>}
    </div>
  );
}