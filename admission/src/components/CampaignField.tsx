"use client";

import {
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import styles from "./CampaignField.module.css";

export type CampaignFieldHandle = {
  validate: () => boolean;
};

type SelectOption = {
  value: string;
  label: string;
};

type CampaignFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  type?: "text" | "select" | "date" | "number";
  placeholder?: string;
  defaultValue?: string;
  errorMessage?: string;
  options?: SelectOption[];
  onValueChange?: (value: string) => void; // tells parent "value changed"
};

const CampaignField = memo(
  forwardRef<CampaignFieldHandle, CampaignFieldProps>(
    function CampaignField(
      {
        label,
        name,
        required = false,
        type = "text",
        placeholder = "",
        defaultValue = "",
        errorMessage = "Can't be empty!",
        options = [],
        onValueChange,
      },
      ref
    ) {
      const inputRef = useRef<HTMLInputElement | null>(null);
      const selectRef = useRef<HTMLSelectElement | null>(null);

      const [error, setError] = useState("");

      const getCurrentValue = () =>
        type === "select"
          ? selectRef.current?.value.trim() ?? ""
          : inputRef.current?.value.trim() ?? "";

      const validate = () => {
        const value = getCurrentValue();

        if (required && value === "") {
          setError(errorMessage);
          return false;
        }

        setError("");
        return true;
      };

      useImperativeHandle(ref, () => ({
        validate,
      }));

      // Runs every time the input/select value changes
      const handleChange = () => {
        const value = getCurrentValue();

        // clear error if it was previously shown and now has a value
        if (error && value !== "") {
          setError("");
        }

        // tell the parent component about the new value (used for live totals etc.)
        onValueChange?.(value);
      };

      // Map our "number" type to the real HTML input type
      const htmlInputType =
        type === "date" ? "date" : type === "number" ? "number" : "text";

      return (
        <div className={styles.field}>
          <label htmlFor={name}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </label>

          {type === "select" ? (
            <select
              ref={selectRef}
              id={name}
              name={name}
              defaultValue={defaultValue}
              onBlur={validate}
              onChange={handleChange}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef}
              id={name}
              name={name}
              type={htmlInputType}
              defaultValue={defaultValue}
              placeholder={placeholder}
              onBlur={validate}
              onChange={handleChange}
            />
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>
      );
    }
  )
);

CampaignField.displayName = "CampaignField";

export default CampaignField;
