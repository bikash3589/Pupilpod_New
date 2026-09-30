"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import MultiSelectTags from "@/components/ui/MultiSelectTags";
import Button from "@/components/ui/Button";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { PencilIcon } from "@/components/ui/icons";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, testMasterStore, subjectToTestStore, marksStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup } from "@/lib/mock/academics/lookups";
import { StudentLite } from "@/types/academics";

interface Filters {
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId: number | null;
  testMasterId: number | null;
}

const emptyFilters: Filters = { programId: null, yearGroupId: null, rollGroupId: null, testMasterId: null };

export default function MarksByStudentRosterPage() {
  const tests = useListStore(testStore);
  const testMasters = useListStore(testMasterStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const marks = useListStore(marksStore);
  const router = useRouter();

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [pendingTestIds, setPendingTestIds] = useState<number[]>([]);

  const [applied, setApplied] = useState<Filters | null>(null);
  const [appliedTestIds, setAppliedTestIds] = useState<number[]>([]);

  const testOptions = tests
    .filter(
      (t) =>
        t.programId === draft.programId &&
        t.yearGroupId === draft.yearGroupId &&
        (!draft.rollGroupId || !t.rollGroupId || t.rollGroupId === draft.rollGroupId) &&
        (!draft.testMasterId || t.testMasterId === draft.testMasterId)
    )
    .map((t) => ({ id: t.id, label: t.name }));

  const canGo = !!draft.programId && !!draft.yearGroupId && !!draft.rollGroupId && pendingTestIds.length > 0;

  function handleGo() {
    if (!canGo) return;
    setApplied(draft);
    setAppliedTestIds(pendingTestIds);
  }

  const roster = applied ? studentsForRollGroup(applied.rollGroupId) : [];
  const selectedTests = tests.filter((t) => appliedTestIds.includes(t.id));

  function completion(studentId: number, testId: number) {
    const total = subjectToTest.filter((st) => st.testId === testId).length;
    const entered = marks.filter((m) => m.studentId === studentId && m.testId === testId && m.marksObtained != null).length;
    return { entered, total };
  }

  const columns: DataTableColumn<StudentLite>[] = [
    { key: "admissionNo", header: "Admission No", sortable: true },
    { key: "name", header: "Student", sortable: true },
    ...selectedTests.map<DataTableColumn<StudentLite>>((t) => ({
      key: `test-${t.id}`,
      header: t.name,
      render: (s) => {
        const { entered, total } = completion(s.id, t.id);
        return (
          <div className="flex items-center gap-8">
            <span className={`badge ${total > 0 && entered === total ? "badge-success" : "badge-warning"}`}>
              {entered}/{total}
            </span>
            <Link href={`/academics/marks/by-student/${s.id}?testId=${t.id}`} className="icon-btn" title="Enter Marks" aria-label="Enter Marks">
              <PencilIcon />
            </Link>
          </div>
        );
      },
    })),
  ];

  const exportRows: Record<string, string>[] = roster.map((s) => ({
    admissionNo: s.admissionNo,
    name: s.name,
    ...Object.fromEntries(
      selectedTests.map((t) => {
        const { entered, total } = completion(s.id, t.id);
        return [t.name, `${entered}/${total}`];
      })
    ),
  }));

  const exportColumns = [
    { key: "admissionNo", header: "Admission No" },
    { key: "name", header: "Student" },
    ...selectedTests.map((t) => ({ key: t.name, header: t.name })),
  ];

  function handleMarksEntry() {
    if (roster.length === 0 || selectedTests.length === 0) return;
    router.push(`/academics/marks/by-student/${roster[0].id}?testId=${selectedTests[0].id}`);
  }

  return (
    <AcademicListPage title="Marks Entry By Student" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Marks Entry By Student" }]}>
      <div className="card">
        <div className="card-pad" style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <CascadingClassPicker
            programId={draft.programId}
            yearGroupId={draft.yearGroupId}
            rollGroupId={draft.rollGroupId}
            onChange={(next) => {
              setDraft({ ...draft, ...next });
              setPendingTestIds([]);
            }}
            labels={{ program: "Program *", yearGroup: "Class *", rollGroup: "Section *" }}
          />
          <div className="filter-field">
            <label>Test Type</label>
            <select
              className="select"
              value={draft.testMasterId ?? ""}
              onChange={(e) => {
                setDraft({ ...draft, testMasterId: e.target.value ? Number(e.target.value) : null });
                setPendingTestIds([]);
              }}
            >
              <option value="">All</option>
              {testMasters.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field" style={{ flex: 1, minWidth: 260 }}>
            <label>
              Test Name<span className="req">*</span>
            </label>
            <MultiSelectTags
              options={testOptions}
              selectedIds={pendingTestIds}
              onChange={setPendingTestIds}
              placeholder={draft.rollGroupId ? "Select Test" : "Select Program, Class and Section first"}
              disabled={!draft.rollGroupId}
            />
          </div>
          <Button variant="primary" onClick={handleGo} disabled={!canGo} disabledReason="Select Program, Class, Section and at least one Test Name.">
            Go
          </Button>
        </div>

        <div className="card-pad" style={{ display: "flex", gap: 8, paddingTop: 0, flexWrap: "wrap" }}>
          <ExportExcelButton
            rows={exportRows}
            columns={exportColumns}
            filename="marks-entry-report.csv"
            label="Download Report"
            disabled={!applied}
          />
          <ExportExcelButton
            rows={exportRows}
            columns={exportColumns}
            filename="marks-entry-export.csv"
            label="Export To Excel"
            disabled={!applied}
          />
          <Button
            variant="secondary"
            onClick={handleMarksEntry}
            disabled={!applied || roster.length === 0}
            disabledReason="Generate the table first."
          >
            Marks Entry
          </Button>
        </div>

        {applied ? (
          <DataTable bare rowKey={(s) => s.id} rows={roster} columns={columns} emptyMessage="No students found for this class and section." />
        ) : (
          <div className="card-pad">
            <div className="empty-state">Select a Program, Class, Section and Test Name, then click Go to generate the report.</div>
          </div>
        )}
      </div>
    </AcademicListPage>
  );
}
