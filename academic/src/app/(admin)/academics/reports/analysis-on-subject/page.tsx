"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import { useListStore } from "@/lib/mock/createListStore";
import { departmentStore, subjectToTestStore, testStore, marksStore } from "@/lib/mock/academics/stores";
import { rollGroups, studentsForRollGroup, yearGroups } from "@/lib/mock/academics/lookups";

export default function AnalysisOnSubjectPage() {
  const departments = useListStore(departmentStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const tests = useListStore(testStore);
  const marks = useListStore(marksStore);

  const [departmentId, setDepartmentId] = useState<number | "">(1);

  const configs = subjectToTest.filter((s) => s.departmentId === departmentId);

  const rows = configs.map((s) => {
    const test = tests.find((t) => t.id === s.testId);
    const rollGroup = rollGroups.find((r) => r.id === test?.rollGroupId);
    const roster = test?.rollGroupId ? studentsForRollGroup(test.rollGroupId) : [];
    const values = roster
      .map((st) => marks.find((m) => m.studentId === st.id && m.departmentId === departmentId && m.testId === s.testId)?.marksObtained)
      .filter((v): v is number => typeof v === "number");
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return {
      test: test?.name ?? "Test",
      class: rollGroup ? `${yearGroups.find((y) => y.id === rollGroup.yearGroupId)?.name} ${rollGroup.name}` : "—",
      average: Number(avg.toFixed(1)),
    };
  });

  return (
    <AcademicListPage
      title="Analysis on Subject"
      subtitle="Cross-class comparison for a single subject across every test it's configured on."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Reports" }, { label: "Analysis on Subject" }]}
    >
      <div className="filter-bar">
        <div className="filter-field">
          <label>Subject</label>
          <select className="select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select subject</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
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
                <th>Test</th>
                <th>Class / Section</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.test}</td>
                  <td>{r.class}</td>
                  <td>{r.average}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">Select a subject to compare its performance across classes.</div>
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
