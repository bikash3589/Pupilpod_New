"use client";

import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import Button from "@/components/ui/Button";
import { useListStore } from "@/lib/mock/createListStore";
import { gradeSystemStore } from "@/lib/mock/academics/stores";
import { AssessmentMethod, AssessmentOption } from "@/types/academics";

export interface TestInstanceDraft {
  name: string;
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId: number | null;
  gradeSystemId: number | null;
  assessmentMethod: AssessmentMethod;
  assessmentOption: AssessmentOption;
  maxMarks: number | "";
  minMarks: number | "";
  enableRemarks: boolean;
  enableSchedule: boolean;
  startDate: string;
  endDate: string;
  isShow: boolean;
  enableHtml: boolean;
  enablePdf: boolean;
  enablePublish: boolean;
  enableTestReport: boolean;
  lockMarksEntry: boolean;
}

interface TestInstanceFormProps {
  value: TestInstanceDraft;
  onChange: (next: TestInstanceDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
}

function toggle(label: string, checked: boolean, onChange: (v: boolean) => void) {
  return (
    <label className="checkbox-row" key={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export default function TestInstanceForm({ value, onChange, onSubmit, onCancel, submitLabel = "Save" }: TestInstanceFormProps) {
  const gradeSystems = useListStore(gradeSystemStore);

  function set<K extends keyof TestInstanceDraft>(key: K, val: TestInstanceDraft[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 780 }}>
      <div className="field">
        <label>
          Test Name<span className="req">*</span>
        </label>
        <input className="input" value={value.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div className="field-row">
        <CascadingClassPicker
          programId={value.programId}
          yearGroupId={value.yearGroupId}
          rollGroupId={value.rollGroupId}
          onChange={(next) => onChange({ ...value, ...next })}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Grade System</label>
          <select className="select" value={value.gradeSystemId ?? ""} onChange={(e) => set("gradeSystemId", e.target.value ? Number(e.target.value) : null)}>
            <option value="">None</option>
            {gradeSystems.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Assessment Method</label>
          <select className="select" value={value.assessmentMethod} onChange={(e) => set("assessmentMethod", e.target.value as AssessmentMethod)}>
            <option value="Marks">Marks</option>
            <option value="Grade">Grade</option>
          </select>
        </div>
        <div className="field">
          <label>Assessment Option</label>
          <select className="select" value={value.assessmentOption} onChange={(e) => set("assessmentOption", e.target.value as AssessmentOption)}>
            <option value="Radio Button">Radio Button</option>
            <option value="Dropdown">Dropdown</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Max Marks</label>
          <input className="input" type="number" value={value.maxMarks} onChange={(e) => set("maxMarks", e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Min Marks</label>
          <input className="input" type="number" value={value.minMarks} onChange={(e) => set("minMarks", e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Start Date</label>
          <input className="input" type="date" value={value.startDate} onChange={(e) => set("startDate", e.target.value)} disabled={!value.enableSchedule} />
        </div>
        <div className="field">
          <label>End Date</label>
          <input className="input" type="date" value={value.endDate} onChange={(e) => set("endDate", e.target.value)} disabled={!value.enableSchedule} />
        </div>
      </div>

      <div className="section-title">Options</div>
      <div className="field-row">
        {toggle("Enable Remarks", value.enableRemarks, (v) => set("enableRemarks", v))}
        {toggle("Enable Schedule", value.enableSchedule, (v) => set("enableSchedule", v))}
        {toggle("Show Test", value.isShow, (v) => set("isShow", v))}
        {toggle("Enable HTML Report", value.enableHtml, (v) => set("enableHtml", v))}
        {toggle("Enable PDF Report", value.enablePdf, (v) => set("enablePdf", v))}
        {toggle("Enable Publish", value.enablePublish, (v) => set("enablePublish", v))}
        {toggle("Enable Test Report", value.enableTestReport, (v) => set("enableTestReport", v))}
        {toggle("Lock Marks Entry", value.lockMarksEntry, (v) => set("lockMarksEntry", v))}
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
