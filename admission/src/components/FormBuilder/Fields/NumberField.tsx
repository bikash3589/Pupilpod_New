
"use client";

// Self-contained number input with +/- stepper buttons.
//
// IMPORTANT: minDigits/maxDigits validate the LENGTH of the number
// (how many digits long it is), NOT the number's value.
//   minDigits = 3, maxDigits = 5  ->  "123" through "12345" are all
//   valid lengths, whether the actual number is small or large.
//
// This means the validation behaves in two different ways, on purpose:
//   - maxDigits is enforced LIVE, while typing — once you've typed that
//     many digits, the field simply won't accept any more (same idea
//     as a normal maxLength on a text input).
//   - minDigits is enforced as a VISIBLE WARNING (red border + message)
//     once you've typed something shorter than that — we can't force
//     you to "finish" typing the way we can block you from over-typing,
//     so this just tells you clearly that you're not there yet.

import { useState } from "react";
// import { Plus, Minus } from "lucide-react";
import styles from "./NumberField.module.css";

interface NumberFieldProps {
  placeholder?: string;
  minDigits?: number;
  maxDigits?: number;
  step?: number;
  disabled?: boolean;
}

// Counts only the actual digit characters in a string — a leading "-"
// sign doesn't count as a digit.
function countDigits(text: string): number {
  return (text.match(/\d/g) ?? []).length;
}

export default function NumberField({ placeholder, minDigits, maxDigits, step = 1, disabled = false }: NumberFieldProps) {
  // What's shown in the box, kept as a plain string so in-progress
  // typing (like a lone "-") doesn't need any awkward type juggling.
  const [rawValue, setRawValue] = useState<string>("");

  function parseNumber(text: string): number | null {
    if (text === "" || text === "-") return null;
    const parsed = Number(text);
    return Number.isNaN(parsed) ? null : parsed;
  }

  // Runs on every keystroke.
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;

    // Only allow digits and a single leading minus sign through at all.
    if (next !== "" && !/^-?\d*$/.test(next)) return;

    // THE ACTUAL FIX: if typing this character would push the digit
    // count past maxDigits, reject the keystroke entirely — the input
    // just won't grow any further, exactly like maxLength does on a
    // normal text field.
    if (maxDigits !== undefined && countDigits(next) > maxDigits) return;

    setRawValue(next);
  }

  // +/- buttons still work the same as before, but now they also
  // refuse to push the number past maxDigits (so clicking + can't
  // sneak past the digit limit the way typing can't either).
//   function step_(direction: 1 | -1) {
//     const current = parseNumber(rawValue) ?? 0;
//     const next = current + direction * step;
//     const nextText = String(next);

//     if (maxDigits !== undefined && countDigits(nextText) > maxDigits) return;

//     setRawValue(nextText);
//   }

  const digitCount = countDigits(rawValue);
  const isTooShort = rawValue !== "" && rawValue !== "-" && minDigits !== undefined && digitCount < minDigits;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow} data-no-drag>
        {/* <button
          type="button"
          className={styles.stepButton}
          onClick={() => step_(-1)}
          title="Decrease"
          data-no-drag
        >
          <Minus size={14} />
        </button> */}

        <input
          type="text"
          inputMode="numeric"
          className={`${styles.input} ${isTooShort ? styles.invalid : ""}`}
          placeholder={placeholder}
          value={disabled ? "" : rawValue}
          onChange={disabled ? undefined : handleChange}
          readOnly={disabled}
          disabled={disabled}
          data-no-drag
        />

        {/* <button
          type="button"
          className={styles.stepButton}
          onClick={() => step_(1)}
          title="Increase"
          data-no-drag
        >
          <Plus size={14} />
        </button> */}
      </div>

      {isTooShort && (
        <span className={styles.errorText}>
          Enter at least {minDigits} digit{minDigits === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}