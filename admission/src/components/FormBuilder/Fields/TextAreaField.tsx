"use client";

// Self-contained textarea that grows to fit its content and shows a
// live character counter. Respects maxLength from Properties ->
// validation.maxLength (if set).

import { useRef, useState } from "react";
import styles from "./TextAreaField.module.css";

interface TextAreaFieldProps {
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export default function TextAreaField({ placeholder, maxLength, disabled = false }: TextAreaFieldProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    if (maxLength && next.length > maxLength) return; // hard stop at the limit
    setValue(next);

    // Auto-resize: collapse first so it can shrink back down, then grow
    // to fit whatever is actually typed.
    const element = textareaRef.current;
    if (element) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    }
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder={placeholder}
        value={disabled ? "" : value}
        onChange={disabled ? undefined : handleChange}
        readOnly={disabled}
        disabled={disabled}
        rows={3}
        data-no-drag
      />
      <div className={styles.counter}>
        {maxLength ? `${value.length}/${maxLength}` : value.length}
      </div>
    </div>
  );
}