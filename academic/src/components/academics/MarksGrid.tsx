"use client";

import { useState } from "react";
import SaveMarksButton from "@/components/academics/buttons/SaveMarksButton";
import { useToast } from "@/components/ui/Toast";

export interface MarksGridRow {
  id: number;
  label: string;
  sublabel?: string;
}

export interface MarksGridColumn {
  id: number;
  label: string;
  maxMarks?: number;
  minMarks?: number;
}

export type MarksGridCellKey = `${number}:${number}`;

interface MarksGridProps {
  /** "student" = rows are students (typical "enter marks by subject" screen); "subject" = rows are subjects (typical "enter marks by student" screen). */
  axis: "student" | "subject";
  rows: MarksGridRow[];
  columns: MarksGridColumn[];
  assessmentMethod: "Marks" | "Grade";
  gradeOptions?: { id: number; name: string }[];
  values: Record<MarksGridCellKey, number | string | null>;
  onChange: (rowId: number, colId: number, value: number | string | null) => void;
  lockedCells?: Set<MarksGridCellKey>;
  lockReason?: string;
  showRemarks?: boolean;
  remarks?: Record<number, string>;
  onRemarkChange?: (rowId: number, value: string) => void;
  onSave: () => void;
  saveDisabledReason?: string | null;
}

export default function MarksGrid({
  axis,
  rows,
  columns,
  assessmentMethod,
  gradeOptions = [],
  values,
  onChange,
  lockedCells,
  lockReason = "Marks entry is locked for this test.",
  showRemarks,
  remarks,
  onRemarkChange,
  onSave,
  saveDisabledReason,
}: MarksGridProps) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function isLocked(rowId: number, colId: number) {
    return lockedCells?.has(`${rowId}:${colId}`) ?? false;
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave();
      toast("Marks saved.", "success");
    }, 300);
  }

  return (
    <div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{axis === "student" ? "Student" : "Subject"}</th>
              {columns.map((c) => (
                <th key={c.id}>
                  {c.label}
                  {c.maxMarks != null && (
                    <div style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>
                      Max {c.maxMarks}
                      {c.minMarks != null ? ` / Min ${c.minMarks}` : ""}
                    </div>
                  )}
                </th>
              ))}
              {showRemarks && <th>Remark</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.label}</strong>
                  {row.sublabel && <div className="text-muted text-sm">{row.sublabel}</div>}
                </td>
                {columns.map((col) => {
                  const key: MarksGridCellKey = `${row.id}:${col.id}`;
                  const locked = isLocked(row.id, col.id);
                  const value = values[key] ?? "";
                  return (
                    <td key={col.id}>
                      {assessmentMethod === "Marks" ? (
                        <input
                          className="input"
                          style={{ width: 90 }}
                          type="number"
                          min={0}
                          max={col.maxMarks}
                          value={value === null ? "" : value}
                          disabled={locked}
                          title={locked ? lockReason : undefined}
                          onChange={(e) =>
                            onChange(row.id, col.id, e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      ) : (
                        <select
                          className="select"
                          style={{ width: 110 }}
                          value={value === null ? "" : value}
                          disabled={locked}
                          title={locked ? lockReason : undefined}
                          onChange={(e) => onChange(row.id, col.id, e.target.value || null)}
                        >
                          <option value="">—</option>
                          {gradeOptions.map((g) => (
                            <option key={g.id} value={g.name}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  );
                })}
                {showRemarks && (
                  <td>
                    <input
                      className="input"
                      style={{ width: 200 }}
                      value={remarks?.[row.id] ?? ""}
                      onChange={(e) => onRemarkChange?.(row.id, e.target.value)}
                    />
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (showRemarks ? 2 : 1)}>
                  <div className="empty-state">No rows to display for the current selection.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 0 && (
        <div className="form-actions">
          <SaveMarksButton onSave={handleSave} disabledReason={saveDisabledReason} saving={saving} />
        </div>
      )}
    </div>
  );
}
