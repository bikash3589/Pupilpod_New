"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, marksStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup } from "@/lib/mock/academics/lookups";

export default function AnalysisReportPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);

  const [programId, setProgramId] = useState<number | null>(1);
  const [yearGroupId, setYearGroupId] = useState<number | null>(7);
  const [rollGroupId, setRollGroupId] = useState<number | null>(5);
  const [testId, setTestId] = useState<number | "">(1);

  const roster = studentsForRollGroup(rollGroupId);
  const testOptions = tests.filter(
    (t) => t.programId === programId && t.yearGroupId === yearGroupId && (!rollGroupId || !t.rollGroupId || t.rollGroupId === rollGroupId)
  );
  const subjects = subjectToTest.filter((s) => s.testId === testId);

  const rows = subjects.map((s) => {
    const values = roster
      .map((st) => marks.find((m) => m.studentId === st.id && m.departmentId === s.departmentId && m.testId === testId)?.marksObtained)
      .filter((v): v is number => typeof v === "number");
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const passCount = values.filter((v) => (s.minMarks == null ? true : v >= s.minMarks)).length;
    return {
      subject: departments.find((d) => d.id === s.departmentId)?.name ?? "Subject",
      entered: values.length,
      total: roster.length,
      average: Number(avg.toFixed(1)),
      highest: values.length ? Math.max(...values) : 0,
      lowest: values.length ? Math.min(...values) : 0,
      passPct: values.length ? Number(((passCount / values.length) * 100).toFixed(1)) : 0,
    };
  });

  return (
    <AcademicListPage
      title="Analysis Report"
      subtitle="Per-subject class performance analysis."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Reports" }, { label: "Analysis" }]}
      helperNote="Section 13/14 of ACADEMIC_FRONTEND_PLAN.md were not fully detailed when this plan was authored — this screen is a best-effort implementation pending the remainder of the spec."
      actions={<ExportExcelButton rows={rows} columns={[
        { key: "subject", header: "Subject" },
        { key: "average", header: "Average" },
        { key: "highest", header: "Highest" },
        { key: "lowest", header: "Lowest" },
        { key: "passPct", header: "Pass %" },
      ]} filename="analysis-report.csv" />}
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
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Entered</th>
                <th>Average</th>
                <th>Highest</th>
                <th>Lowest</th>
                <th>Pass %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject}>
                  <td>{r.subject}</td>
                  <td>
                    {r.entered} / {r.total}
                  </td>
                  <td>{r.average}</td>
                  <td>{r.highest}</td>
                  <td>{r.lowest}</td>
                  <td>{r.passPct}%</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Select a class and test to run the analysis.</div>
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
