"use client";

import { useState } from "react";
import CustomCheckbox from "./CustomCheckbox";
import styles from "./GroupField.module.css";

interface CheckboxGroupFieldProps {
  options: string[];
}

export default function CheckboxGroupField({ options }: CheckboxGroupFieldProps) {
  // A set of which option labels are currently checked. Several can be
  // checked at once — that's the whole point of a checkbox group.
  const [checkedOptions, setCheckedOptions] = useState<Set<string>>(new Set());

  function toggle(option: string) {
    setCheckedOptions((previous) => {
      const next = new Set(previous);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  }

  return (
    <div className={styles.list}>
      {options.map((option) => (
        <CustomCheckbox
          key={option}
          label={option}
          checked={checkedOptions.has(option)}
          onChange={() => toggle(option)}
        />
      ))}
    </div>
  );
}