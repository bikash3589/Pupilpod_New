"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, marksStore, gradeBandStore } from "@/lib/mock/academics/stores";
import { students } from "@/lib/mock/academics/lookups";

export default function ResultDetailPage(props: PageProps<"/academics/results/[testId]">) {
  const { testId } = use(props.params);
  return (
    <Suspense fallback={null}>
      <ResultDetailInner testId={testId} />
    </Suspense>
  );
}

function ResultDetailInner({ testId }: { testId: string }) {
  const searchParams = useSearchParams();
  const studentId = Number(searchParams.get("studentId"));

  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore).filter((s) => s.testId === Number(testId));
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);
  const gradeBands = useListStore(gradeBandStore);

  const test = tests.find((t) => t.id === Number(testId));
  const student = students.find((s) => s.id === studentId);

  const rows = subjectToTest.map((s) => {
    const entry = marks.find((m) => m.studentId === studentId && m.departmentId === s.departmentId && m.testId === Number(testId));
    const band = gradeBands.find((b) => b.gradeSystemId === s.gradeSystemId && entry?.marksObtained != null && entry.marksObtained >= b.lowerLimit && entry.marksObtained <= b.upperLimit);
    return {
      subject: departments.find((d) => d.id === s.departmentId)?.name ?? "Subject",
      marks: entry?.marksObtained ?? null,
      maxMarks: s.maxMarks,
      grade: band?.gradeName ?? "—",
      remark: entry?.remark,
    };
  });

  return (
    <AcademicListPage
      title={`Result — ${test?.name ?? ""}`}
      subtitle={student?.name}
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Results", href: "/academics/results" }, { label: "Detail" }]}
    >
      {!test?.enablePublish && (
        <div className="helper-note">This test report has not been published yet — values shown are provisional.</div>
      )}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject}>
                  <td>{r.subject}</td>
                  <td>
                    {r.marks ?? "—"} {r.maxMarks ? `/ ${r.maxMarks}` : ""}
                  </td>
                  <td>{r.grade}</td>
                  <td>{r.remark ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No subjects configured for this test.</div>
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
