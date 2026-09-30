"use client";

import styles from "./MultiSelectTags.module.css";

type MultiSelectTagsProps = {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export default function MultiSelectTags({
  options,
  selected,
  onChange,
  placeholder = "Select",
}: MultiSelectTagsProps) {
  // Guards against data saved before a field was added to the shape (e.g.
  // older localStorage entries that predate this field).
  const safeSelected = selected ?? [];
  const availableOptions = options.filter((option) => !safeSelected.includes(option));

  const addOption = (value: string) => {
    if (!value || safeSelected.includes(value)) return;
    onChange([...safeSelected, value]);
  };

  const removeOption = (value: string) => {
    onChange(safeSelected.filter((item) => item !== value));
  };

  return (
    <div className={styles.container}>
      {safeSelected.map((value) => (
        <span className={styles.chip} key={value}>
          {value}
          <button
            type="button"
            onClick={() => removeOption(value)}
            title="Remove"
            aria-label={`Remove ${value}`}
          >
            ✕
          </button>
        </span>
      ))}

      <select
        className={styles.addSelect}
        value=""
        onChange={(e) => addOption(e.target.value)}
      >
        <option value="" disabled>
          {safeSelected.length === 0 ? placeholder : "+ Add"}
        </option>
        {availableOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
