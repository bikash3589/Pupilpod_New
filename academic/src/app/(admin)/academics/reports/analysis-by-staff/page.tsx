"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import { useListStore } from "@/lib/mock/createListStore";
import { departmentStore, subjectToTestStore, testStore, marksStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup } from "@/lib/mock/academics/lookups";

const teacherNames: Record<number, string> = { 1: "Mrs. Kapoor", 2: "Mr. Sen", 3: "Ms. Fernandes", 4: "Mr. Rao", 6: "Mrs. Bhat", 7: "Mr. Iyer" };

export default function AnalysisByStaffPage() {
  const departments = useListStore(departmentStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const tests = useListStore(testStore);
  const marks = useListStore(marksStore);

  const [departmentId, setDepartmentId] = useState<number | "">("");

  const configs = subjectToTest.filter((s) => s.departmentId === departmentId);

  const rows = configs.map((s) => {
    const test = tests.find((t) => t.id === s.testId);
    const roster = test?.rollGroupId ? studentsForRollGroup(test.rollGroupId) : [];
    const values = roster
      .map((st) => marks.find((m) => m.studentId === st.id && m.departmentId === departmentId && m.testId === s.testId)?.marksObtained)
      .filter((v): v is number => typeof v === "number");
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { test: test?.name ?? "Test", entered: values.length, total: roster.length, average: Number(avg.toFixed(1)) };
  });

  return (
    <AcademicListPage
      title="Analysis by Staff"
      subtitle="Subject performance grouped by the subject's assigned teacher, across every test they own."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Reports" }, { label: "Analysis by Staff" }]}
      helperNote="No teacher-assignment model exists yet in this frontend phase — subject ownership is simulated via a static name lookup until staff/HR data is wired in."
    >
      <div className="filter-bar">
        <div className="filter-field">
          <label>Subject (Teacher)</label>
          <select className="select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select subject</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {teacherNames[d.id] ? `— ${teacherNames[d.id]}` : ""}
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
                <th>Entered</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.test}>
                  <td>{r.test}</td>
                  <td>
                    {r.entered} / {r.total}
                  </td>
                  <td>{r.average}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">Select a subject to view its performance across tests.</div>
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
