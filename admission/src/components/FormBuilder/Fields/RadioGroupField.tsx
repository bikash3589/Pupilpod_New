"use client";

import { useState } from "react";
import CustomRadio from "./CustomRadio";
import styles from "./GroupField.module.css";

interface RadioGroupFieldProps {
  options: string[];
}

export default function RadioGroupField({ options }: RadioGroupFieldProps) {
  // Only one option can be selected at a time — that's the difference
  // from CheckboxGroupField, which is why this is a single value
  // instead of a Set.
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className={styles.list}>
      {options.map((option) => (
        <CustomRadio
          key={option}
          label={option}
          checked={selected === option}
          onChange={() => setSelected(option)}
        />
      ))}
    </div>
  );
}