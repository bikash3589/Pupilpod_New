"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import MarksGrid, { MarksGridCellKey } from "@/components/academics/MarksGrid";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, skillStore, marksStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function MarksBySubjectSkillPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const skills = useListStore(skillStore);
  const marks = useListStore(marksStore);
  const { toast } = useToast();

  const [programId, setProgramId] = useState<number | null>(1);
  const [yearGroupId, setYearGroupId] = useState<number | null>(7);
  const [rollGroupId, setRollGroupId] = useState<number | null>(5);
  const [testId, setTestId] = useState<number | "">(1);
  const [departmentId, setDepartmentId] = useState<number | "">(2);

  const roster = studentsForRollGroup(rollGroupId);
  const testOptions = tests.filter(
    (t) => t.programId === programId && t.yearGroupId === yearGroupId && (!rollGroupId || !t.rollGroupId || t.rollGroupId === rollGroupId)
  );
  const subjectOptions = subjectToTest.filter((s) => s.testId === testId);
  const subjectConfig = subjectOptions.find((s) => s.departmentId === departmentId);
  const skillColumns = subjectConfig?.skillConfig ?? [];

  const [localValues, setLocalValues] = useState<Record<MarksGridCellKey, number | string | null>>({});

  // Plain per-render value (not useMemo) — it must pick up every keystroke in localValues
  // immediately, or Save reads a stale snapshot that never included what was just typed.
  const values: Record<MarksGridCellKey, number | string | null> = { ...localValues };
  roster.forEach((s) => {
    skillColumns.forEach((sk) => {
      const key: MarksGridCellKey = `${s.id}:${sk.skillId}`;
      if (!(key in values)) {
        const existing = marks.find((m) => m.studentId === s.id && m.departmentId === departmentId && m.skillId === sk.skillId && m.testId === testId);
        values[key] = existing?.marksObtained ?? null;
      }
    });
  });

  function handleSave() {
    if (!testId || !departmentId) return;
    let saved = 0;
    roster.forEach((s) => {
      skillColumns.forEach((sk) => {
        const key: MarksGridCellKey = `${s.id}:${sk.skillId}`;
        const value = values[key];
        const marksVal = value === "" || value == null ? null : Number(value);
        const existing = marks.find((m) => m.studentId === s.id && m.departmentId === departmentId && m.skillId === sk.skillId && m.testId === testId);
        if (existing) {
          if (existing.marksObtained === marksVal) return;
          marksStore.update(existing.id, { marksObtained: marksVal });
        } else if (marksVal != null) {
          marksStore.add({ id: nextId(), testId, studentId: s.id, departmentId, skillId: sk.skillId, marksObtained: marksVal, status: 0 });
        } else {
          return;
        }
        saved += 1;
      });
    });
    toast(saved > 0 ? "Marks saved." : "No changes to save.", saved > 0 ? "success" : "info");
  }

  return (
    <AcademicListPage
      title="Marks Entry — By Subject & Skill"
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Marks Entry" }, { label: "By Subject & Skill" }]}
    >
      <div className="filter-bar">
        <CascadingClassPicker
          programId={programId}
          yearGroupId={yearGroupId}
          rollGroupId={rollGroupId}
          onChange={(next) => {
            setProgramId(next.programId);
            setYearGroupId(next.yearGroupId);
            setRollGroupId(next.rollGroupId);
            setTestId("");
            setDepartmentId("");
          }}
        />
        <div className="filter-field">
          <label>Test</label>
          <select className="select" value={testId} onChange={(e) => { setTestId(e.target.value ? Number(e.target.value) : ""); setDepartmentId(""); }}>
            <option value="">Select test</option>
            {testOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Subject</label>
          <select className="select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")} disabled={!testId}>
            <option value="">Select subject</option>
            {subjectOptions.map((s) => (
              <option key={s.id} value={s.departmentId}>
                {departments.find((d) => d.id === s.departmentId)?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {testId && departmentId ? (
        skillColumns.length > 0 ? (
          <div className="card card-pad">
            <MarksGrid
              axis="student"
              rows={roster.map((s) => ({ id: s.id, label: s.name, sublabel: s.admissionNo }))}
              columns={skillColumns.map((sk) => ({ id: sk.skillId, label: skills.find((s) => s.id === sk.skillId)?.name ?? "Skill" }))}
              assessmentMethod="Marks"
              values={values}
              onChange={(rowId, colId, val) => setLocalValues((prev) => ({ ...prev, [`${rowId}:${colId}`]: val }))}
              onSave={handleSave}
            />
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">This subject has no skill weighting configured for the selected test.</div>
          </div>
        )
      ) : (
        <div className="card">
          <div className="empty-state">Select a class, test and subject to begin skill-wise marks entry.</div>
        </div>
      )}
    </AcademicListPage>
  );
}
