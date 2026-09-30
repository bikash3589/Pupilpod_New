"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, marksStore } from "@/lib/mock/academics/stores";
import { students } from "@/lib/mock/academics/lookups";

export default function PreviousProgressPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);

  const [studentId, setStudentId] = useState(students[0].id);
  const student = students.find((s) => s.id === studentId)!;

  const applicableTests = tests.filter((t) => t.yearGroupId === student.yearGroupId);
  const subjectIds = Array.from(new Set(subjectToTest.filter((s) => applicableTests.some((t) => t.id === s.testId)).map((s) => s.departmentId)));

  return (
    <AcademicListPage
      title="Previous Progress"
      subtitle="Term-over-term trend for one student across all subjects and tests taken so far."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Reports" }, { label: "Previous Progress" }]}
    >
      <div className="filter-bar">
        <div className="filter-field">
          <label>Student</label>
          <select className="select" value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                {applicableTests.map((t) => (
                  <th key={t.id}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectIds.map((depId) => (
                <tr key={depId}>
                  <td>{departments.find((d) => d.id === depId)?.name}</td>
                  {applicableTests.map((t) => {
                    const entry = marks.find((m) => m.studentId === studentId && m.departmentId === depId && m.testId === t.id);
                    return <td key={t.id}>{entry?.marksObtained ?? "—"}</td>;
                  })}
                </tr>
              ))}
              {subjectIds.length === 0 && (
                <tr>
                  <td colSpan={applicableTests.length + 1}>
                    <div className="empty-state">No prior test data found for this student.</div>
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
