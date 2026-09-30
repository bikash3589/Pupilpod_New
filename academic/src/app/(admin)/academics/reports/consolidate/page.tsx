"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, marksStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup } from "@/lib/mock/academics/lookups";

export default function ConsolidateReportPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const marks = useListStore(marksStore);

  const [programId, setProgramId] = useState<number | null>(1);
  const [yearGroupId, setYearGroupId] = useState<number | null>(7);
  const [rollGroupId, setRollGroupId] = useState<number | null>(5);

  const roster = studentsForRollGroup(rollGroupId);
  const applicableTests = tests.filter(
    (t) => t.programId === programId && t.yearGroupId === yearGroupId && (!rollGroupId || !t.rollGroupId || t.rollGroupId === rollGroupId)
  );

  const rows = roster.map((s) => {
    const perTest = applicableTests.map((t) => {
      const subjects = subjectToTest.filter((st) => st.testId === t.id);
      const total = subjects.reduce((sum, st) => {
        const entry = marks.find((m) => m.studentId === s.id && m.departmentId === st.departmentId && m.testId === t.id);
        return sum + (entry?.marksObtained ?? 0);
      }, 0);
      return { testId: t.id, total };
    });
    return { student: s, perTest, grandTotal: perTest.reduce((sum, p) => sum + p.total, 0) };
  });

  const exportRows = rows.map((r) => ({
    student: r.student.name,
    admissionNo: r.student.admissionNo,
    ...Object.fromEntries(r.perTest.map((p) => [`Test ${p.testId}`, p.total])),
    total: r.grandTotal,
  }));

  return (
    <AcademicListPage
      title="Consolidated Report"
      subtitle="Total marks per student across all tests for the selected class."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Reports" }, { label: "Consolidated Report" }]}
      actions={
        <ExportExcelButton
          rows={exportRows}
          columns={[
            { key: "admissionNo", header: "Admission No" },
            { key: "student", header: "Student" },
            { key: "total", header: "Grand Total" },
          ]}
          filename="consolidated-report.csv"
        />
      }
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
          }}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student</th>
                {applicableTests.map((t) => (
                  <th key={t.id}>{t.name}</th>
                ))}
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student.id}>
                  <td>{r.student.admissionNo}</td>
                  <td>{r.student.name}</td>
                  {r.perTest.map((p) => (
                    <td key={p.testId}>{p.total}</td>
                  ))}
                  <td>
                    <strong>{r.grandTotal}</strong>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={applicableTests.length + 3}>
                    <div className="empty-state">Select a class and section to consolidate results.</div>
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
