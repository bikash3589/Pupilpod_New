"use client";

// Custom dropdown, same trigger-button + floating-panel pattern as
// DateField.tsx — so it reuses DateField's CSS classes for the trigger
// and panel shell (.wrapper/.trigger/.valueText/.placeholderText/.icon/
// .panel), and only defines its own classes for the option rows below.

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import dateFieldStyles from "./DateField.module.css";
import styles from "./SelectField.module.css";

interface SelectFieldProps {
  options: string[];
  placeholder?: string;
}

export default function SelectField({ options, placeholder = "Select an option" }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className={dateFieldStyles.wrapper} ref={wrapperRef} data-no-drag>
      <button
        type="button"
        className={dateFieldStyles.trigger}
        onClick={() => setIsOpen((previous) => !previous)}
        data-no-drag
      >
        <span className={selected ? dateFieldStyles.valueText : dateFieldStyles.placeholderText}>
          {selected ?? placeholder}
        </span>
        <ChevronDown size={16} className={dateFieldStyles.icon} />
      </button>

      {isOpen && (
        <div className={dateFieldStyles.panel} data-no-drag>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.optionRow}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              data-no-drag
            >
              <span>{option}</span>
              {selected === option && <Check size={14} className={styles.checkIcon} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}