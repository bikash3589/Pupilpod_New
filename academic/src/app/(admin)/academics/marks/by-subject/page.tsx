"use client";

import { Fragment, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { HistoryIcon } from "@/components/ui/icons";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, testMasterStore, subjectToTestStore, departmentStore, marksStore, marksHistoryStore, gradeBandStore, skillStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { StudentLite } from "@/types/academics";

interface Filters {
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId: number | null;
  departmentId: number | null;
  skillId: number | null;
  testMasterId: number | null;
  testIds: number[];
}

const emptyFilters: Filters = {
  programId: null,
  yearGroupId: null,
  rollGroupId: null,
  departmentId: null,
  skillId: null,
  testMasterId: null,
  testIds: [],
};

interface Entry {
  marks: number | "";
  gradeId: number | null;
}

type EntryKey = `${number}:${number}`;
const entryKey = (studentId: number, testId: number): EntryKey => `${studentId}:${testId}`;

export default function MarksBySubjectPage() {
  const tests = useListStore(testStore);
  const testMasters = useListStore(testMasterStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);
  const marksHistory = useListStore(marksHistoryStore);
  const gradeBands = useListStore(gradeBandStore);
  const skills = useListStore(skillStore);
  const { toast } = useToast();

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [localEntries, setLocalEntries] = useState<Record<EntryKey, Entry>>({});
  const [historyFor, setHistoryFor] = useState<StudentLite | null>(null);

  const testsInScope = tests.filter(
    (t) =>
      (!draft.programId || t.programId === draft.programId) &&
      (!draft.yearGroupId || t.yearGroupId === draft.yearGroupId) &&
      // A Test with no rollGroupId applies to every Section of its YearGroup, not none of them.
      (!draft.rollGroupId || !t.rollGroupId || t.rollGroupId === draft.rollGroupId)
  );
  const testMasterOptions = testMasters.filter((tm) => testsInScope.some((t) => t.testMasterId === tm.id));
  const testOptions = testsInScope.filter((t) => !draft.testMasterId || t.testMasterId === draft.testMasterId);

  const missing = [
    !draft.programId && "Program",
    !draft.yearGroupId && "Class",
    !draft.rollGroupId && "Section",
    !draft.departmentId && "Subject",
    draft.testIds.length === 0 && "Test",
  ].filter((v): v is string => !!v);

  function toggleTest(testId: number) {
    setDraft((prev) => ({
      ...prev,
      testIds: prev.testIds.includes(testId) ? prev.testIds.filter((id) => id !== testId) : [...prev.testIds, testId],
    }));
  }

  function handleGo() {
    if (missing.length > 0) return;
    setApplied(draft);
    setLocalEntries({});
  }

  const roster = applied ? studentsForRollGroup(applied.rollGroupId) : [];
  const department = applied ? departments.find((d) => d.id === applied.departmentId) : undefined;
  const appliedTests = applied ? applied.testIds.map((id) => tests.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t) : [];

  function testContext(testId: number) {
    const test = tests.find((t) => t.id === testId)!;
    const subjectConfig = applied ? subjectToTest.find((s) => s.testId === testId && s.departmentId === applied.departmentId) : undefined;
    const gradeBandsForSystem = gradeBands.filter((b) => b.gradeSystemId === subjectConfig?.gradeSystemId);
    return { test, subjectConfig, gradeBandsForSystem, showGrade: gradeBandsForSystem.length > 0 };
  }

  function getEntry(studentId: number, testId: number): Entry {
    const key = entryKey(studentId, testId);
    if (localEntries[key]) return localEntries[key];
    const existing = applied && marks.find((m) => m.studentId === studentId && m.testId === testId && m.departmentId === applied.departmentId);
    return { marks: existing?.marksObtained ?? "", gradeId: existing?.gradeId ?? null };
  }

  function patchEntry(studentId: number, testId: number, patch: Partial<Entry>) {
    const key = entryKey(studentId, testId);
    setLocalEntries((prev) => ({ ...prev, [key]: { ...getEntry(studentId, testId), ...patch } }));
  }

  function resolvedBand(entry: Entry, gradeBandsForSystem: ReturnType<typeof gradeBands.filter>) {
    if (entry.gradeId != null) return gradeBandsForSystem.find((b) => b.id === entry.gradeId);
    const marksVal = entry.marks === "" ? null : Number(entry.marks);
    if (marksVal == null) return undefined;
    return gradeBandsForSystem.find((b) => marksVal >= b.lowerLimit && marksVal <= b.upperLimit);
  }

  function handleSave() {
    if (!applied) return;
    let changedCount = 0;
    roster.forEach((s) => {
      appliedTests.forEach((t) => {
        const entry = getEntry(s.id, t.id);
        const marksVal = entry.marks === "" ? null : Number(entry.marks);
        const existing = marks.find((m) => m.studentId === s.id && m.testId === t.id && m.departmentId === applied.departmentId);
        const changed = !existing || existing.marksObtained !== marksVal || (existing.gradeId ?? null) !== entry.gradeId;
        if (!changed) return;
        changedCount += 1;
        const payload = {
          testId: t.id,
          studentId: s.id,
          departmentId: applied.departmentId!,
          skillId: applied.skillId ?? undefined,
          marksObtained: marksVal,
          gradeId: entry.gradeId ?? undefined,
        };
        if (existing) {
          // Log the prior value before overwriting it — the audit trail is what it *was*, not what it becomes.
          marksHistoryStore.add({
            id: nextId(),
            testId: existing.testId,
            studentId: existing.studentId,
            departmentId: existing.departmentId,
            skillId: existing.skillId,
            marksObtained: existing.marksObtained,
            gradeId: existing.gradeId,
            remark: existing.remark,
            createdAt: new Date().toISOString(),
          });
          marksStore.update(existing.id, payload);
        } else {
          marksStore.add({ id: nextId(), status: 0, ...payload });
        }
      });
    });
    toast(changedCount > 0 ? "Marks saved." : "No changes to save.", changedCount > 0 ? "success" : "info");
  }

  return (
    <AcademicListPage title="Marks Entry By Subject" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Marks Entry By Subject" }]}>
      <div className="card card-pad">
        <div className="section-title" style={{ border: "none", marginBottom: 14, paddingBottom: 0 }}>
          Enter Marks By Subject
        </div>

        <div className="flex items-start gap-12" style={{ flexWrap: "wrap" }}>
          <CascadingClassPicker
            programId={draft.programId}
            yearGroupId={draft.yearGroupId}
            rollGroupId={draft.rollGroupId}
            onChange={(next) =>
              setDraft({ ...draft, programId: next.programId, yearGroupId: next.yearGroupId, rollGroupId: next.rollGroupId, testMasterId: null, testIds: [] })
            }
            labels={{ program: "Program *", yearGroup: "Class *", rollGroup: "Section *" }}
          />

          <div className="filter-field">
            <label>
              Subjects<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.departmentId ?? ""}
              onChange={(e) => setDraft({ ...draft, departmentId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Select subject</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
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

          <div className="filter-field">
            <label>Test Type</label>
            <select
              className="select"
              value={draft.testMasterId ?? ""}
              onChange={(e) => {
                const testMasterId = e.target.value ? Number(e.target.value) : null;
                setDraft((prev) => ({
                  ...prev,
                  testMasterId,
                  // Drop any picked Tests that no longer belong to the newly chosen Test Type.
                  testIds: prev.testIds.filter((id) => {
                    const t = tests.find((x) => x.id === id);
                    return !testMasterId || t?.testMasterId === testMasterId;
                  }),
                }));
              }}
            >
              <option value="">Please Select</option>
              {testMasterOptions.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field" style={{ minWidth: 220 }}>
            <label>
              Select Test<span className="req">*</span>
            </label>
            {testOptions.length === 0 ? (
              <p className="disabled-note" style={{ margin: 0, height: 34, display: "flex", alignItems: "center" }}>
                No tests for this Class yet.
              </p>
            ) : (
              <div className="multiselect">
                {testOptions.map((t) => (
                  <label key={t.id}>
                    <input type="checkbox" checked={draft.testIds.includes(t.id)} onChange={() => toggleTest(t.id)} />
                    {t.name}
                  </label>
                ))}
              </div>
            )}
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

      {applied && department && appliedTests.length > 0 ? (
        <>
          <div className="section-title" style={{ border: "none", marginTop: 20, marginBottom: 12, paddingBottom: 0 }}>
            Subject : {department.name}
          </div>
          <div className="flex justify-between items-center mt-12" style={{ marginBottom: 12 }}>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
            <ExportExcelButton
              label="Export To Excel"
              filename={`marks-${department.name}.csv`}
              rows={roster.map((s, i) => {
                const base: Record<string, string | number> = { slNo: i + 1, name: s.name, admissionNo: s.admissionNo };
                appliedTests.forEach((t) => {
                  const { gradeBandsForSystem } = testContext(t.id);
                  const entry = getEntry(s.id, t.id);
                  const band = resolvedBand(entry, gradeBandsForSystem);
                  base[`marks_${t.id}`] = entry.marks;
                  base[`grade_${t.id}`] = band?.gradeName ?? "";
                  base[`status_${t.id}`] = band?.subjectStatus ?? "";
                });
                return base;
              })}
              columns={[
                { key: "slNo", header: "SL No" },
                { key: "name", header: "Student Name" },
                { key: "admissionNo", header: "Admission No" },
                ...appliedTests.flatMap((t) => [
                  { key: `marks_${t.id}`, header: `${t.name} — Marks Obtained` },
                  { key: `grade_${t.id}`, header: `${t.name} — Grade` },
                  { key: `status_${t.id}`, header: `${t.name} — Grade Status` },
                ]),
              ]}
            />
          </div>

          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>SL No</th>
                    <th rowSpan={2}>Student Name</th>
                    <th rowSpan={2}>Admission No</th>
                    <th rowSpan={2}>Marks History</th>
                    {appliedTests.map((t) => {
                      const { showGrade } = testContext(t.id);
                      return (
                        <th key={t.id} colSpan={showGrade ? 3 : 1} style={{ textAlign: "center" }}>
                          {t.name}
                        </th>
                      );
                    })}
                  </tr>
                  <tr>
                    {appliedTests.map((t) => {
                      const { subjectConfig, showGrade } = testContext(t.id);
                      return (
                        <Fragment key={t.id}>
                          <th>Marks Obtained{subjectConfig?.maxMarks != null ? `(${subjectConfig.maxMarks})` : ""}</th>
                          {showGrade && <th>Grade</th>}
                          {showGrade && <th>Grade Status</th>}
                        </Fragment>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.admissionNo}</td>
                      <td>
                        <button className="icon-btn" title="Marks History" aria-label="Marks History" onClick={() => setHistoryFor(s)}>
                          <HistoryIcon />
                        </button>
                      </td>
                      {appliedTests.map((t) => {
                        const { test, subjectConfig, gradeBandsForSystem, showGrade } = testContext(t.id);
                        const entry = getEntry(s.id, t.id);
                        const band = resolvedBand(entry, gradeBandsForSystem);
                        const locked = !!test.lockMarksEntry;
                        return (
                          <Fragment key={t.id}>
                            <td>
                              <input
                                className="input"
                                style={{ width: 90 }}
                                type="number"
                                min={0}
                                max={subjectConfig?.maxMarks}
                                value={entry.marks}
                                disabled={locked}
                                title={locked ? "Marks entry is locked for this test." : undefined}
                                onChange={(e) => patchEntry(s.id, t.id, { marks: e.target.value === "" ? "" : Number(e.target.value) })}
                              />
                            </td>
                            {showGrade && (
                              <td>
                                {test.assessmentOption === "Radio Button" ? (
                                  <div className="flex items-center gap-8" style={{ flexWrap: "wrap" }}>
                                    {gradeBandsForSystem.map((b) => (
                                      <label key={b.id} className="checkbox-row text-sm">
                                        <input
                                          type="radio"
                                          name={`grade-${s.id}-${t.id}`}
                                          checked={band?.id === b.id}
                                          disabled={locked}
                                          onChange={() => patchEntry(s.id, t.id, { gradeId: b.id })}
                                        />
                                        {b.gradeName}
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <select
                                    className="select"
                                    style={{ width: 110 }}
                                    value={band?.id ?? ""}
                                    disabled={locked}
                                    onChange={(e) => patchEntry(s.id, t.id, { gradeId: e.target.value ? Number(e.target.value) : null })}
                                  >
                                    <option value="">—</option>
                                    {gradeBandsForSystem.map((b) => (
                                      <option key={b.id} value={b.id}>
                                        {b.gradeName}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                            )}
                            {showGrade && (
                              <td>
                                {band ? <span className={`badge ${band.subjectStatus === "Pass" ? "badge-success" : "badge-danger"}`}>{band.subjectStatus}</span> : "—"}
                              </td>
                            )}
                          </Fragment>
                        );
                      })}
                    </tr>
                  ))}
                  {roster.length === 0 && (
                    <tr>
                      <td colSpan={4 + appliedTests.reduce((n, t) => n + (testContext(t.id).showGrade ? 3 : 1), 0)}>
                        <div className="empty-state">No students in this Section.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card mt-16">
          <div className="empty-state">Select Program, Class, Section, Subject and Test, then click Go to begin marks entry.</div>
        </div>
      )}

      <Modal open={!!historyFor} title={`Marks History — ${historyFor?.name ?? ""}`} onClose={() => setHistoryFor(null)}>
        {(() => {
          const rows = applied
            ? marksHistory
                .filter((h) => h.studentId === historyFor?.id && h.departmentId === applied.departmentId && applied.testIds.includes(h.testId))
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            : [];
          if (rows.length === 0) {
            return <p className="text-sm text-muted">No edit history has been recorded for this entry yet.</p>;
          }
          return (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Saved At</th>
                    <th>Test</th>
                    <th>Marks Obtained</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h) => (
                    <tr key={h.id}>
                      <td>{new Date(h.createdAt).toLocaleString()}</td>
                      <td>{tests.find((t) => t.id === h.testId)?.name ?? "—"}</td>
                      <td>{h.marksObtained ?? "—"}</td>
                      <td>{gradeBands.find((b) => b.id === h.gradeId)?.gradeName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Modal>
    </AcademicListPage>
  );
}
