"use client";

import { Department } from "@/types/academics";
import { departmentTypes } from "@/lib/mock/academics/subjects";
import Button from "@/components/ui/Button";

export interface SubjectDraft {
  name: string;
  nameShort: string;
  type: Department["type"];
  subjectCode: string;
  sectionIds: number[];
  role: Department["role"] | "";
  readMin?: number;
  readMedium?: number;
  readMax?: number;
  writeMin?: number;
  writeMedium?: number;
  writeMax?: number;
  memoryMin?: number;
  memoryMedium?: number;
  memoryMax?: number;
}

interface SubjectFormProps {
  value: SubjectDraft;
  onChange: (next: SubjectDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  /** School-level feature flag — replaces the legacy `strpos($baseurl, "...")` tenant check. */
  showReadWriteMemoryFields?: boolean;
}

const sectionOptions = [
  { id: 5, name: "9-A" },
  { id: 6, name: "9-B" },
  { id: 7, name: "10-A" },
];

const roleRequiredTypes: Department["type"][] = ["Administration", "Learning Area"];

function num(v: string) {
  return v === "" ? undefined : Number(v);
}

export default function SubjectForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  showReadWriteMemoryFields = false,
}: SubjectFormProps) {
  function set<K extends keyof SubjectDraft>(key: K, val: SubjectDraft[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 720 }}>
      <div className="field-row">
        <div className="field">
          <label>
            Type<span className="req">*</span>
          </label>
          <select className="select" value={value.type} onChange={(e) => set("type", e.target.value as Department["type"])}>
            {departmentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>
            Name<span className="req">*</span>
          </label>
          <input className="input" value={value.name} onChange={(e) => set("name", e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Short Name</label>
          <input className="input" value={value.nameShort} onChange={(e) => set("nameShort", e.target.value)} />
        </div>
        <div className="field">
          <label>Subject Code</label>
          <input className="input" value={value.subjectCode} onChange={(e) => set("subjectCode", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Sections</label>
        <div className="multiselect">
          {sectionOptions.map((s) => (
            <label key={s.id}>
              <input
                type="checkbox"
                checked={value.sectionIds.includes(s.id)}
                onChange={(e) =>
                  set(
                    "sectionIds",
                    e.target.checked ? [...value.sectionIds, s.id] : value.sectionIds.filter((id) => id !== s.id)
                  )
                }
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      {roleRequiredTypes.includes(value.type) && (
        <div className="field">
          <label>Role</label>
          <select className="select" value={value.role} onChange={(e) => set("role", e.target.value as Department["role"])}>
            <option value="">None</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Director">Director</option>
          </select>
        </div>
      )}

      {showReadWriteMemoryFields && (
        <>
          <div className="section-title">Read / Write / Memory Assessment Range</div>
          <div className="field-row">
            <div className="field">
              <label>Read Min</label>
              <input className="input" type="number" value={value.readMin ?? ""} onChange={(e) => set("readMin", num(e.target.value))} />
            </div>
            <div className="field">
              <label>Read Medium</label>
              <input className="input" type="number" value={value.readMedium ?? ""} onChange={(e) => set("readMedium", num(e.target.value))} />
            </div>
            <div className="field">
              <label>Read Max</label>
              <input className="input" type="number" value={value.readMax ?? ""} onChange={(e) => set("readMax", num(e.target.value))} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Write Min</label>
              <input className="input" type="number" value={value.writeMin ?? ""} onChange={(e) => set("writeMin", num(e.target.value))} />
            </div>
            <div className="field">
              <label>Write Medium</label>
              <input className="input" type="number" value={value.writeMedium ?? ""} onChange={(e) => set("writeMedium", num(e.target.value))} />
            </div>
            <div className="field">
              <label>Write Max</label>
              <input className="input" type="number" value={value.writeMax ?? ""} onChange={(e) => set("writeMax", num(e.target.value))} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Memory Min</label>
              <input className="input" type="number" value={value.memoryMin ?? ""} onChange={(e) => set("memoryMin", num(e.target.value))} />
            </div>
            <div className="field">
              <label>Memory Medium</label>
              <input className="input" type="number" value={value.memoryMedium ?? ""} onChange={(e) => set("memoryMedium", num(e.target.value))} />
            </div>
            <div className="field">
              <label>Memory Max</label>
              <input className="input" type="number" value={value.memoryMax ?? ""} onChange={(e) => set("memoryMax", num(e.target.value))} />
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={!value.name.trim()}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
