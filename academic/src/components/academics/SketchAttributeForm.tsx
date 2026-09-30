"use client";

import { SketchAttributeCategory } from "@/types/academics";
import { sketchAttributeCategories } from "@/lib/mock/academics/sketches";
import { initialGradeSystems } from "@/lib/mock/academics/gradeSystems";
import { initialDepartments } from "@/lib/mock/academics/subjects";

export interface SketchAttributeDraft {
  attributeName: string;
  attributeCategory: SketchAttributeCategory;
  attributeType: string;
  position: number;
  gradeSystemId?: number | null;
  departmentId?: number | null;
  finalFormula?: string;
  canUseForRank: boolean;
  graphTitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  legend?: string;
  colorHex?: string;
  pluginType?: string;
  pluginValue?: string;
  aggregateFunction?: string;
}

interface SketchAttributeFormProps {
  value: SketchAttributeDraft;
  onChange: (next: SketchAttributeDraft) => void;
}

const entityFieldOptions = ["Student Name", "Admission No", "Roll No", "Date of Birth", "Photo", "Father Name"];
const attendanceOptions = ["Present Days", "Total Days", "Attendance Percentage"];
const pluginOptions = ["Date Format", "Case Transform (upper/lower/title)"];
const aggregateFunctions = ["Sum", "Average", "Max", "Min"];

export default function SketchAttributeForm({ value, onChange }: SketchAttributeFormProps) {
  function set<K extends keyof SketchAttributeDraft>(key: K, val: SketchAttributeDraft[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div>
      <div className="field-row">
        <div className="field">
          <label>
            Attribute Name<span className="req">*</span>
          </label>
          <input className="input" value={value.attributeName} onChange={(e) => set("attributeName", e.target.value)} />
        </div>
        <div className="field">
          <label>
            Attribute Category<span className="req">*</span>
          </label>
          <select
            className="select"
            value={value.attributeCategory}
            onChange={(e) => set("attributeCategory", e.target.value as SketchAttributeCategory)}
          >
            {sketchAttributeCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Attribute Type</label>
          <input
            className="input"
            value={value.attributeType}
            onChange={(e) => set("attributeType", e.target.value)}
          />
          <span className="hint">
            Free text placeholder — real options are DB-seeded from examinationReportTemplateConfiguration.table_label
            (see ACADEMIC_DATABASE_SCHEMA.md Section 1).
          </span>
        </div>
        <div className="field">
          <label>Position</label>
          <input
            className="input"
            type="number"
            value={value.position}
            onChange={(e) => set("position", Number(e.target.value))}
          />
        </div>
      </div>

      {value.attributeCategory === "Entity" && (
        <div className="field">
          <label>Entity Field</label>
          <select className="select" value={value.pluginValue ?? ""} onChange={(e) => set("pluginValue", e.target.value)}>
            <option value="">Select field</option>
            {entityFieldOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.attributeCategory === "Test" && (
        <div className="field-row">
          <div className="field">
            <label>Subject</label>
            <select
              className="select"
              value={value.departmentId ?? ""}
              onChange={(e) => set("departmentId", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select subject</option>
              {initialDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Grade System</label>
            <select
              className="select"
              value={value.gradeSystemId ?? ""}
              onChange={(e) => set("gradeSystemId", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">None</option>
              {initialGradeSystems.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {value.attributeCategory === "Computed" && (
        <div className="field">
          <label>Final Formula</label>
          <textarea
            className="textarea"
            placeholder="e.g. SUM(Mathematics, English, Science)"
            value={value.finalFormula ?? ""}
            onChange={(e) => set("finalFormula", e.target.value)}
          />
        </div>
      )}

      {value.attributeCategory === "Attendance" && (
        <div className="field">
          <label>Attendance Metric</label>
          <select className="select" value={value.pluginValue ?? ""} onChange={(e) => set("pluginValue", e.target.value)}>
            <option value="">Select metric</option>
            {attendanceOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.attributeCategory === "Wired" && (
        <div className="field-row">
          <div className="field">
            <label>Plugin</label>
            <select className="select" value={value.pluginType ?? ""} onChange={(e) => set("pluginType", e.target.value)}>
              <option value="">Select plugin</option>
              {pluginOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Value</label>
            <input className="input" value={value.pluginValue ?? ""} onChange={(e) => set("pluginValue", e.target.value)} />
          </div>
        </div>
      )}

      {value.attributeCategory === "Aggregate" && (
        <div className="field">
          <label>Aggregate Function</label>
          <select
            className="select"
            value={value.aggregateFunction ?? ""}
            onChange={(e) => set("aggregateFunction", e.target.value)}
          >
            <option value="">Select function</option>
            {aggregateFunctions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.attributeCategory === "Graph" && (
        <div className="field-row">
          <div className="field">
            <label>Graph Title</label>
            <input className="input" value={value.graphTitle ?? ""} onChange={(e) => set("graphTitle", e.target.value)} />
          </div>
          <div className="field">
            <label>X Axis Title</label>
            <input className="input" value={value.xAxisTitle ?? ""} onChange={(e) => set("xAxisTitle", e.target.value)} />
          </div>
          <div className="field">
            <label>Y Axis Title</label>
            <input className="input" value={value.yAxisTitle ?? ""} onChange={(e) => set("yAxisTitle", e.target.value)} />
          </div>
          <div className="field">
            <label>Legend</label>
            <input className="input" value={value.legend ?? ""} onChange={(e) => set("legend", e.target.value)} />
          </div>
          <div className="field">
            <label>Color</label>
            <input
              className="input"
              type="color"
              value={value.colorHex ?? "#2f5fdb"}
              onChange={(e) => set("colorHex", e.target.value)}
            />
          </div>
        </div>
      )}

      {value.attributeCategory === "External" && (
        <div className="field">
          <label>External Source Key</label>
          <input
            className="input"
            placeholder="e.g. external_system.field_name"
            value={value.pluginValue ?? ""}
            onChange={(e) => set("pluginValue", e.target.value)}
          />
        </div>
      )}

      {value.attributeCategory === "Strength" && (
        <p className="text-sm text-muted">No additional configuration required for Strength attributes.</p>
      )}

      <div className="checkbox-row mt-8">
        <input
          type="checkbox"
          checked={value.canUseForRank}
          onChange={(e) => set("canUseForRank", e.target.checked)}
          id="canUseForRank"
        />
        <label htmlFor="canUseForRank">Can use for rank calculation</label>
      </div>
    </div>
  );
}
