"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, marksStore, gradeBandStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup } from "@/lib/mock/academics/lookups";

export default function MarksByStudentResultPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);
  const gradeBands = useListStore(gradeBandStore);

  const [programId, setProgramId] = useState<number | null>(1);
  const [yearGroupId, setYearGroupId] = useState<number | null>(7);
  const [rollGroupId, setRollGroupId] = useState<number | null>(5);
  const [testId, setTestId] = useState<number | "">(1);
  const [studentId, setStudentId] = useState<number | "">("");

  const roster = studentsForRollGroup(rollGroupId);
  const testOptions = tests.filter(
    (t) => t.programId === programId && t.yearGroupId === yearGroupId && (!rollGroupId || !t.rollGroupId || t.rollGroupId === rollGroupId)
  );
  const subjects = subjectToTest.filter((s) => s.testId === testId);

  const rows = subjects.map((s) => {
    const entry = marks.find((m) => m.studentId === studentId && m.departmentId === s.departmentId && m.testId === testId);
    const band = gradeBands.find((b) => b.gradeSystemId === s.gradeSystemId && entry?.marksObtained != null && entry.marksObtained >= b.lowerLimit && entry.marksObtained <= b.upperLimit);
    return { subject: departments.find((d) => d.id === s.departmentId)?.name ?? "Subject", marks: entry?.marksObtained ?? null, grade: band?.gradeName ?? "—", status: band?.subjectStatus ?? (entry?.marksObtained != null ? "Pass" : "—") };
  });

  const total = rows.reduce((sum, r) => sum + (typeof r.marks === "number" ? r.marks : 0), 0);
  const maxTotal = subjects.reduce((sum, s) => sum + (s.maxMarks ?? 0), 0);

  return (
    <AcademicListPage
      title="Marks Entry — By Student (Result)"
      subtitle="Read-oriented result summary per student for a selected test."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Marks Entry" }, { label: "By Student (Result)" }]}
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
            setStudentId("");
          }}
        />
        <div className="filter-field">
          <label>Test</label>
          <select className="select" value={testId} onChange={(e) => setTestId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select test</option>
            {testOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Student</label>
          <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")} disabled={!testId}>
            <option value="">Select student</option>
            {roster.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {studentId && testId ? (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.subject}>
                    <td>{r.subject}</td>
                    <td>{r.marks ?? "—"}</td>
                    <td>{r.grade}</td>
                    <td>
                      <span className={`badge ${r.status === "Pass" ? "badge-success" : r.status === "Fail" ? "badge-danger" : "badge-neutral"}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td colSpan={3}>
                    <strong>
                      {total} / {maxTotal}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">Select a test and student to view the result summary.</div>
        </div>
      )}
    </AcademicListPage>
  );
}
