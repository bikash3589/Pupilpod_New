"use client";

import { useState } from "react";
import { FILTER_OPERATORS } from "@/types/applicationList";
import type {
  ApplicationFilterRule,
  ApplicationFilterTree,
  FilterOperator,
} from "@/types/applicationList";
import styles from "./AdvanceSearchPanel.module.css";

type AdvanceSearchPanelProps = {
  fields: { name: string; label: string }[];
  onSearch: (tree: ApplicationFilterTree) => void;
  onClear: () => void;
};

const emptyRule = (field: string): ApplicationFilterRule => ({
  field,
  operator: "contains",
  value: "",
});

// Safe, structured replacement for the legacy raw-SQL Query Builder widget —
// field/operator/value only, never a SQL fragment. The available fields
// come from the campaign's own form-builder canvas (getFluentFormFields),
// the same safe metadata source the field-mapping screen already uses.
export default function AdvanceSearchPanel({
  fields,
  onSearch,
  onClear,
}: AdvanceSearchPanelProps) {
  const firstField = fields[0]?.name ?? "";
  const [condition, setCondition] = useState<"AND" | "OR">("AND");
  const [rules, setRules] = useState<ApplicationFilterRule[]>([emptyRule(firstField)]);

  const updateRule = (index: number, patch: Partial<ApplicationFilterRule>) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRule = () => setRules((prev) => [...prev, emptyRule(firstField)]);
  const removeRule = (index: number) =>
    setRules((prev) => prev.filter((_, i) => i !== index));

  const needsValue = (operator: FilterOperator) =>
    operator !== "is_empty" && operator !== "is_not_empty";

  const handleSearch = () => {
    onSearch({ condition, rules });
  };

  const handleClear = () => {
    setRules([emptyRule(firstField)]);
    setCondition("AND");
    onClear();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.conditionRow}>
        Match
        <select value={condition} onChange={(e) => setCondition(e.target.value as "AND" | "OR")}>
          <option value="AND">All</option>
          <option value="OR">Any</option>
        </select>
        of the following rules:
      </div>

      {rules.map((rule, index) => (
        <div className={styles.rule} key={index}>
          <select
            value={rule.field}
            onChange={(e) => updateRule(index, { field: e.target.value })}
          >
            {fields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={rule.operator}
            onChange={(e) => updateRule(index, { operator: e.target.value as FilterOperator })}
          >
            {FILTER_OPERATORS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          {needsValue(rule.operator) && (
            <input
              type="text"
              value={rule.value ?? ""}
              onChange={(e) => updateRule(index, { value: e.target.value })}
            />
          )}

          <button
            type="button"
            onClick={() => removeRule(index)}
            aria-label="Remove rule"
            disabled={rules.length === 1}
          >
            ✕
          </button>
        </div>
      ))}

      <div className={styles.actions}>
        <button type="button" className="navigationButton" onClick={addRule}>
          Add Rule
        </button>
        <button type="button" className="navigationButton" onClick={handleSearch}>
          Search
        </button>
        <button type="button" className="navigationButton" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
