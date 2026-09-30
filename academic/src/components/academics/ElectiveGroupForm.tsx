"use client";

import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import Button from "@/components/ui/Button";
import { useListStore } from "@/lib/mock/createListStore";
import { departmentStore } from "@/lib/mock/academics/stores";

export interface ElectiveGroupDraft {
  name: string;
  orderNo: number;
  minSelection: number;
  maxSelection: number;
  programId: number | null;
  yearGroupId: number | null;
  sectionIds: number[];
  departmentIds: number[];
}

interface ElectiveGroupFormProps {
  value: ElectiveGroupDraft;
  onChange: (next: ElectiveGroupDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
}

const sectionOptions = [
  { id: 5, name: "9-A" },
  { id: 6, name: "9-B" },
  { id: 7, name: "10-A" },
];

export default function ElectiveGroupForm({ value, onChange, onSubmit, onCancel, submitLabel = "Save" }: ElectiveGroupFormProps) {
  const departments = useListStore(departmentStore);

  function set<K extends keyof ElectiveGroupDraft>(key: K, val: ElectiveGroupDraft[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 720 }}>
      <div className="field">
        <label>
          Group Name<span className="req">*</span>
        </label>
        <input className="input" value={value.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="field-row">
        <CascadingClassPicker
          programId={value.programId}
          yearGroupId={value.yearGroupId}
          onChange={(next) => onChange({ ...value, programId: next.programId, yearGroupId: next.yearGroupId })}
          showSection={false}
        />
      </div>
      <div className="field">
        <label>Sections</label>
        <div className="multiselect">
          {sectionOptions.map((s) => (
            <label key={s.id}>
              <input
                type="checkbox"
                checked={value.sectionIds.includes(s.id)}
                onChange={(e) => set("sectionIds", e.target.checked ? [...value.sectionIds, s.id] : value.sectionIds.filter((id) => id !== s.id))}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Member Subjects</label>
        <div className="multiselect">
          {departments.map((d) => (
            <label key={d.id}>
              <input
                type="checkbox"
                checked={value.departmentIds.includes(d.id)}
                onChange={(e) => set("departmentIds", e.target.checked ? [...value.departmentIds, d.id] : value.departmentIds.filter((id) => id !== d.id))}
              />
              {d.name}
            </label>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Order No</label>
          <input className="input" type="number" value={value.orderNo} onChange={(e) => set("orderNo", Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Min Selection</label>
          <input className="input" type="number" value={value.minSelection} onChange={(e) => set("minSelection", Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Max Selection</label>
          <input className="input" type="number" value={value.maxSelection} onChange={(e) => set("maxSelection", Number(e.target.value))} />
        </div>
      </div>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={!value.name.trim() || !value.programId || !value.yearGroupId}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
