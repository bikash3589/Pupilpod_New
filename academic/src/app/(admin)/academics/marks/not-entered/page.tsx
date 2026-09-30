"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import MultiSelectTags from "@/components/ui/MultiSelectTags";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { useListStore } from "@/lib/mock/createListStore";
import { testMasterStore, testStore, subjectToTestStore, departmentStore, marksStore } from "@/lib/mock/academics/stores";
import { programs, yearGroups, yearGroupsForProgram, rollGroupsForYearGroup, studentsForRollGroup } from "@/lib/mock/academics/lookups";

interface Filters {
  testMasterId: number | null;
  programId: number | null;
  yearGroupIds: number[];
  rollGroupId: number | null;
  departmentId: number | null;
}

const emptyFilters: Filters = { testMasterId: null, programId: null, yearGroupIds: [], rollGroupId: null, departmentId: null };

interface MissingRow {
  admissionNo: string;
  studentName: string;
  className: string;
  sectionName: string;
  subjectName: string;
}

export default function MarksNotEnteredPage() {
  const testMasters = useListStore(testMasterStore);
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters | null>(null);

  const classOptions = yearGroupsForProgram(draft.programId).map((yg) => ({ id: yg.id, label: yg.name }));
  const sectionOptions = draft.yearGroupIds.flatMap((ygId) => rollGroupsForYearGroup(ygId));

  const testsInScope = tests.filter(
    (t) =>
      (!draft.programId || t.programId === draft.programId) &&
      draft.yearGroupIds.includes(t.yearGroupId) &&
      (!draft.testMasterId || t.testMasterId === draft.testMasterId)
  );
  const subjectOptions = departments.filter((d) => testsInScope.some((t) => subjectToTest.some((s) => s.testId === t.id && s.departmentId === d.id)));

  const missing = [
    !draft.testMasterId && "Test Name",
    !draft.programId && "Program",
    draft.yearGroupIds.length === 0 && "Class",
  ].filter((v): v is string => !!v);

  function handleSubmit() {
    if (missing.length > 0) return;
    setApplied(draft);
  }

  const rows: MissingRow[] = [];
  if (applied) {
    const scopedTests = tests.filter(
      (t) => t.programId === applied.programId && applied.yearGroupIds.includes(t.yearGroupId) && (!applied.testMasterId || t.testMasterId === applied.testMasterId)
    );
    scopedTests.forEach((t) => {
      const sections = applied.rollGroupId ? [applied.rollGroupId] : rollGroupsForYearGroup(t.yearGroupId).map((r) => r.id);
      const relevantSections = sections.filter((rgId) => !t.rollGroupId || t.rollGroupId === rgId);
      const subjects = subjectToTest.filter((s) => s.testId === t.id && (!applied.departmentId || s.departmentId === applied.departmentId));
      relevantSections.forEach((rgId) => {
        const roster = studentsForRollGroup(rgId);
        roster.forEach((student) => {
          subjects.forEach((subj) => {
            const entry = marks.find((m) => m.studentId === student.id && m.departmentId === subj.departmentId && m.testId === t.id);
            if (entry && entry.marksObtained != null) return;
            rows.push({
              admissionNo: student.admissionNo,
              studentName: student.name,
              className: yearGroups.find((y) => y.id === t.yearGroupId)?.name ?? "—",
              sectionName: rollGroupsForYearGroup(t.yearGroupId).find((r) => r.id === rgId)?.name ?? "—",
              subjectName: departments.find((d) => d.id === subj.departmentId)?.name ?? "Subject",
            });
          });
        });
      });
    });
  }

  return (
    <AcademicListPage title="Marks Not Entered" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Marks Not Entered" }]}>
      <div className="card card-pad">
        <div className="section-title" style={{ border: "none", marginBottom: 14, paddingBottom: 0 }}>
          Marks Not Entered
        </div>

        <div className="flex items-start gap-12" style={{ flexWrap: "wrap" }}>
          <div className="filter-field">
            <label>
              Test Name<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.testMasterId ?? ""}
              onChange={(e) => setDraft({ ...draft, testMasterId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Select Test</option>
              {testMasters.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>
              Program<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.programId ?? ""}
              onChange={(e) => setDraft({ ...draft, programId: e.target.value ? Number(e.target.value) : null, yearGroupIds: [], rollGroupId: null, departmentId: null })}
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field" style={{ minWidth: 220 }}>
            <label>
              Class<span className="req">*</span>
            </label>
            <MultiSelectTags
              options={classOptions}
              selectedIds={draft.yearGroupIds}
              onChange={(ids) => setDraft({ ...draft, yearGroupIds: ids, rollGroupId: null, departmentId: null })}
              placeholder={draft.programId ? "Select Class" : "Select Program first"}
              disabled={!draft.programId}
            />
          </div>

          <div className="filter-field">
            <label>Section</label>
            <select
              className="select"
              value={draft.rollGroupId ?? ""}
              disabled={draft.yearGroupIds.length === 0}
              onChange={(e) => setDraft({ ...draft, rollGroupId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">All Sections</option>
              {sectionOptions.map((rg) => (
                <option key={rg.id} value={rg.id}>
                  {rg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Subject</label>
            <select
              className="select"
              value={draft.departmentId ?? ""}
              disabled={!draft.testMasterId || draft.yearGroupIds.length === 0}
              onChange={(e) => setDraft({ ...draft, departmentId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">All Subjects</option>
              {subjectOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={missing.length > 0}
            disabledReason={missing.length > 0 ? `Select ${missing.join(", ")} first.` : undefined}
          >
            Submit
          </Button>
        </div>

        <div className="flex items-center mt-16" style={{ justifyContent: "flex-end" }}>
          <ExportExcelButton
            label="Export To Excel"
            filename="marks-not-entered.csv"
            disabled={!applied}
            rows={rows}
            columns={[
              { key: "admissionNo", header: "Admission No" },
              { key: "studentName", header: "Student Name" },
              { key: "className", header: "Class" },
              { key: "sectionName", header: "Section" },
              { key: "subjectName", header: "Subject" },
            ]}
          />
        </div>
      </div>

      <div className="card mt-16">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.admissionNo}</td>
                  <td>{r.studentName}</td>
                  <td>{r.className}</td>
                  <td>{r.sectionName}</td>
                  <td>
                    <span className="badge badge-warning">{r.subjectName}</span>
                  </td>
                </tr>
              ))}
              {applied && rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">All marks are entered for this selection.</div>
                  </td>
                </tr>
              )}
              {!applied && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">Select Test Name, Program and Class, then click Submit.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AcademicListPage>
  );
}
