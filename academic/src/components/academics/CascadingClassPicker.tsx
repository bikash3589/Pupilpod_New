"use client";

import { programs, rollGroupsForYearGroup, yearGroupsForProgram } from "@/lib/mock/academics/lookups";

interface CascadingClassPickerProps {
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId?: number | null;
  onChange: (next: { programId: number | null; yearGroupId: number | null; rollGroupId: number | null }) => void;
  showSection?: boolean;
  labels?: { program?: string; yearGroup?: string; rollGroup?: string };
}

export default function CascadingClassPicker({
  programId,
  yearGroupId,
  rollGroupId = null,
  onChange,
  showSection = true,
  labels,
}: CascadingClassPickerProps) {
  const yearGroupOptions = yearGroupsForProgram(programId);
  const rollGroupOptions = yearGroupsForProgramSafe(yearGroupId);

  function yearGroupsForProgramSafe(ygId: number | null) {
    return rollGroupsForYearGroup(ygId);
  }

  return (
    <>
      <div className="filter-field">
        <label>{labels?.program ?? "Program"}</label>
        <select
          className="select"
          value={programId ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            onChange({ programId: val, yearGroupId: null, rollGroupId: null });
          }}
        >
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label>{labels?.yearGroup ?? "Class"}</label>
        <select
          className="select"
          value={yearGroupId ?? ""}
          disabled={!programId}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            onChange({ programId, yearGroupId: val, rollGroupId: null });
          }}
        >
          <option value="">Select Class</option>
          {yearGroupOptions.map((yg) => (
            <option key={yg.id} value={yg.id}>
              {yg.name}
            </option>
          ))}
        </select>
      </div>

      {showSection && (
        <div className="filter-field">
          <label>{labels?.rollGroup ?? "Section"}</label>
          <select
            className="select"
            value={rollGroupId ?? ""}
            disabled={!yearGroupId}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              onChange({ programId, yearGroupId, rollGroupId: val });
            }}
          >
            <option value="">Select Section</option>
            {rollGroupOptions.map((rg) => (
              <option key={rg.id} value={rg.id}>
                {rg.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
