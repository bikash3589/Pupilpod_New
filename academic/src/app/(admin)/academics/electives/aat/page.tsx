"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import MarksGrid, { MarksGridCellKey } from "@/components/academics/MarksGrid";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, testMasterStore, subjectToTestStore, departmentStore, skillStore, marksStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface Filters {
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId: number | null;
  testMasterId: number | null;
  testId: number | null;
  departmentId: number | null;
  skillId: number | null;
}

const emptyFilters: Filters = {
  programId: null,
  yearGroupId: null,
  rollGroupId: null,
  testMasterId: null,
  testId: null,
  departmentId: null,
  skillId: null,
};

export default function AatEntryPage() {
  const tests = useListStore(testStore);
  const testMasters = useListStore(testMasterStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const skills = useListStore(skillStore);
  const marks = useListStore(marksStore);
  const { toast } = useToast();

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [localValues, setLocalValues] = useState<Record<MarksGridCellKey, number | string | null>>({});

  // A Test with no rollGroupId applies to every Section of its YearGroup, not none of them.
  const testsInScope = tests.filter(
    (t) =>
      (!draft.programId || t.programId === draft.programId) &&
      (!draft.yearGroupId || t.yearGroupId === draft.yearGroupId) &&
      (!draft.rollGroupId || !t.rollGroupId || t.rollGroupId === draft.rollGroupId)
  );
  const testMasterOptions = testMasters.filter((tm) => testsInScope.some((t) => t.testMasterId === tm.id));
  const testOptions = testsInScope.filter((t) => !draft.testMasterId || t.testMasterId === draft.testMasterId);

  // Only subjects configured with AAT ("Assessment By All Teachers") on the chosen Test are offered.
  const subjectOptions = draft.testId ? subjectToTest.filter((s) => s.testId === draft.testId && s.aat) : [];

  const missing = [
    !draft.programId && "Program",
    !draft.yearGroupId && "Class",
    !draft.rollGroupId && "Section",
    !draft.testMasterId && "Test Type",
    !draft.testId && "Test Name",
    !draft.departmentId && "Subject",
  ].filter((v): v is string => !!v);

  function handleGo() {
    if (missing.length > 0) return;
    setApplied(draft);
    setLocalValues({});
  }

  const roster = applied ? studentsForRollGroup(applied.rollGroupId) : [];
  const subjectConfig = applied ? subjectToTest.find((s) => s.testId === applied.testId && s.departmentId === applied.departmentId && s.aat) : undefined;
  const department = applied ? departments.find((d) => d.id === applied.departmentId) : undefined;

  const values: Record<MarksGridCellKey, number | string | null> = { ...localValues };
  if (applied && subjectConfig) {
    const departmentId = applied.departmentId!;
    roster.forEach((s) => {
      const key: MarksGridCellKey = `${s.id}:${departmentId}`;
      if (!(key in values)) {
        const existing = marks.find(
          (m) =>
            m.studentId === s.id &&
            m.departmentId === applied.departmentId &&
            m.testId === applied.testId &&
            (applied.skillId == null || m.skillId === applied.skillId)
        );
        values[key] = existing?.marksObtained ?? null;
      }
    });
  }

  function handleSave() {
    if (!applied || !subjectConfig) return;
    const departmentId = applied.departmentId!;
    let saved = 0;
    roster.forEach((s) => {
      const key: MarksGridCellKey = `${s.id}:${departmentId}`;
      const value = values[key];
      const marksVal = value === "" || value == null ? null : Number(value);
      const existing = marks.find(
        (m) => m.studentId === s.id && m.departmentId === departmentId && m.testId === applied.testId && (applied.skillId == null || m.skillId === applied.skillId)
      );
      if (existing) {
        if (existing.marksObtained === marksVal) return;
        marksStore.update(existing.id, { marksObtained: marksVal });
      } else if (marksVal != null) {
        marksStore.add({
          id: nextId(),
          testId: applied.testId!,
          studentId: s.id,
          departmentId,
          skillId: applied.skillId ?? undefined,
          marksObtained: marksVal,
          status: 0,
        });
      } else {
        return;
      }
      saved += 1;
    });
    toast(saved > 0 ? "A.A.T marks saved." : "No changes to save.", saved > 0 ? "success" : "info");
  }

  return (
    <AcademicListPage title="Enter A.A.T" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Enter A.A.T" }]}>
      <div className="card card-pad">
        <div className="section-title" style={{ border: "none", marginBottom: 14, paddingBottom: 0 }}>
          Enter A.A.T(Assesment By All Teachers)
        </div>

        <div className="flex items-start gap-12" style={{ flexWrap: "wrap" }}>
          <CascadingClassPicker
            programId={draft.programId}
            yearGroupId={draft.yearGroupId}
            rollGroupId={draft.rollGroupId}
            onChange={(next) =>
              setDraft({ ...draft, programId: next.programId, yearGroupId: next.yearGroupId, rollGroupId: next.rollGroupId, testMasterId: null, testId: null, departmentId: null })
            }
            labels={{ program: "Program *", yearGroup: "Class *", rollGroup: "Section *" }}
          />

          <div className="filter-field">
            <label>
              Test Type<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.testMasterId ?? ""}
              onChange={(e) => {
                const testMasterId = e.target.value ? Number(e.target.value) : null;
                setDraft((prev) => ({ ...prev, testMasterId, testId: null, departmentId: null }));
              }}
            >
              <option value="">Select Test Type</option>
              {testMasterOptions.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>
              Test Name<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.testId ?? ""}
              disabled={!draft.programId || !draft.yearGroupId || !draft.rollGroupId}
              onChange={(e) => setDraft((prev) => ({ ...prev, testId: e.target.value ? Number(e.target.value) : null, departmentId: null }))}
            >
              <option value="">Select Test Name</option>
              {testOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>
              Subjects<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.departmentId ?? ""}
              disabled={!draft.testId}
              onChange={(e) => setDraft({ ...draft, departmentId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((s) => (
                <option key={s.departmentId} value={s.departmentId}>
                  {departments.find((d) => d.id === s.departmentId)?.name ?? "Subject"}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Skill</label>
            <select className="select" value={draft.skillId ?? ""} onChange={(e) => setDraft({ ...draft, skillId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Select Skill</option>
              {skills.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={handleGo}
            disabled={missing.length > 0}
            disabledReason={missing.length > 0 ? `Select ${missing.join(", ")} first.` : undefined}
          >
            Go
          </Button>
        </div>
      </div>

      {applied && subjectConfig && department ? (
        <div className="card card-pad mt-16">
          <MarksGrid
            axis="student"
            rows={roster.map((s) => ({ id: s.id, label: s.name, sublabel: s.admissionNo }))}
            columns={[{ id: applied.departmentId!, label: department.name, maxMarks: subjectConfig.maxMarks, minMarks: subjectConfig.minMarks }]}
            assessmentMethod={subjectConfig.assessmentMethod}
            values={values}
            onChange={(rowId, colId, val) => setLocalValues((prev) => ({ ...prev, [`${rowId}:${colId}`]: val }))}
            onSave={handleSave}
          />
        </div>
      ) : (
        <div className="card mt-16">
          <div className="empty-state">There are no records to display.</div>
        </div>
      )}
    </AcademicListPage>
  );
}
