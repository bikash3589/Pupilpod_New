"use client";

import { Suspense, use, useState } from "react";
import { useSearchParams } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import MarksGrid, { MarksGridCellKey } from "@/components/academics/MarksGrid";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, marksStore } from "@/lib/mock/academics/stores";
import { students, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function MarksByStudentEntryPage(props: PageProps<"/academics/marks/by-student/[studentId]">) {
  const { studentId } = use(props.params);
  return (
    <Suspense fallback={null}>
      <MarksByStudentEntryInner studentId={studentId} />
    </Suspense>
  );
}

function MarksByStudentEntryInner({ studentId }: { studentId: string }) {
  const searchParams = useSearchParams();
  const testId = Number(searchParams.get("testId"));
  const student = students.find((s) => s.id === Number(studentId));

  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore).filter((s) => s.testId === testId);
  const departments = useListStore(departmentStore);
  const marks = useListStore(marksStore);
  const test = tests.find((t) => t.id === testId);
  const { toast } = useToast();

  const [localValues, setLocalValues] = useState<Record<MarksGridCellKey, number | string | null>>({});

  // Plain per-render value (not useMemo) — it must pick up every keystroke in localValues
  // immediately, or Save reads a stale snapshot that never included what was just typed.
  const values: Record<MarksGridCellKey, number | string | null> = { ...localValues };
  subjectToTest.forEach((s) => {
    const key: MarksGridCellKey = `${s.departmentId}:${testId}`;
    if (!(key in values)) {
      const existing = marks.find((m) => m.studentId === Number(studentId) && m.departmentId === s.departmentId && m.testId === testId);
      values[key] = existing?.marksObtained ?? null;
    }
  });

  function handleSave() {
    const sId = Number(studentId);
    let saved = 0;
    subjectToTest.forEach((s) => {
      const key: MarksGridCellKey = `${s.departmentId}:${testId}`;
      const value = values[key];
      const marksVal = value === "" || value == null ? null : Number(value);
      const existing = marks.find((m) => m.studentId === sId && m.departmentId === s.departmentId && m.testId === testId);
      if (existing) {
        if (existing.marksObtained === marksVal) return;
        marksStore.update(existing.id, { marksObtained: marksVal });
      } else if (marksVal != null) {
        marksStore.add({ id: nextId(), testId, studentId: sId, departmentId: s.departmentId, marksObtained: marksVal, status: 0 });
      } else {
        return;
      }
      saved += 1;
    });
    toast(saved > 0 ? "Marks saved." : "No changes to save.", saved > 0 ? "success" : "info");
  }

  return (
    <AcademicListPage
      title={`Marks Entry — ${student?.name ?? ""}`}
      subtitle={test?.name}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Marks Entry", href: "/academics/marks/by-student" },
        { label: student?.name ?? "Student" },
      ]}
    >
      <div className="card card-pad">
        <MarksGrid
          axis="subject"
          rows={subjectToTest.map((s) => ({ id: s.departmentId, label: departments.find((d) => d.id === s.departmentId)?.name ?? "Subject" }))}
          columns={[{ id: testId, label: test?.name ?? "Test" }]}
          assessmentMethod="Marks"
          values={values}
          onChange={(rowId, colId, val) => setLocalValues((prev) => ({ ...prev, [`${rowId}:${colId}`]: val }))}
          onSave={handleSave}
        />
      </div>
    </AcademicListPage>
  );
}
