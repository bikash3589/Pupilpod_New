"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import CopyToDestinationModal from "@/components/academics/buttons/CopyToDestinationModal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, testMasterStore } from "@/lib/mock/academics/stores";
import { academicYears, nextId, programs, yearGroups } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface Filters {
  academicYearId: number | null;
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId: number | null;
}

const currentYearId = academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0]?.id ?? null;
const emptyFilters: Filters = { academicYearId: currentYearId, programId: null, yearGroupId: null, rollGroupId: null };

export default function TestInstancesPage() {
  const tests = useListStore(testStore);
  const testMasters = useListStore(testMasterStore);
  const { toast } = useToast();

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleGo() {
    setApplied(draft);
    setSelected(new Set());
  }

  function handleClearSearch() {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setSelected(new Set());
  }

  const filtered = tests.filter((t) => {
    const master = testMasters.find((tm) => tm.id === t.testMasterId);
    if (applied.academicYearId && master?.academicYearId !== applied.academicYearId) return false;
    if (applied.programId && t.programId !== applied.programId) return false;
    if (applied.yearGroupId && t.yearGroupId !== applied.yearGroupId) return false;
    if (applied.rollGroupId && t.rollGroupId !== applied.rollGroupId) return false;
    return true;
  });

  const rows = filtered.map((t) => ({
    ...t,
    academicYearName: academicYears.find((y) => y.id === testMasters.find((tm) => tm.id === t.testMasterId)?.academicYearId)?.name ?? "—",
    programName: programs.find((p) => p.id === t.programId)?.name ?? "—",
    className: yearGroups.find((y) => y.id === t.yearGroupId)?.name ?? "—",
  }));

  const selectedTests = tests.filter((t) => selected.has(t.id));

  return (
    <AcademicListPage title="Edit Test" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Edit Test" }]}>
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Manage Test Edit</div>
        </div>
        <div className="card-pad" style={{ display: "flex", gap: 8, paddingBottom: 0 }}>
          <Link href="/academics/tests/instances/new" className="btn btn-primary btn-sm">
            Add Test
          </Link>
          <CopyToDestinationModal
            triggerLabel="Copy Test"
            sourceLabel={selectedTests.map((t) => t.name).join(", ")}
            disabled={selectedTests.length === 0}
            disabledReason="Select at least one Test to copy."
            onCopy={(destination) => {
              selectedTests.forEach((t) => {
                const master = testMasters.find((tm) => tm.id === t.testMasterId);
                const destMaster =
                  master && master.academicYearId === destination.academicYearId
                    ? master
                    : testMasters.find((tm) => tm.name === master?.name && tm.academicYearId === destination.academicYearId);
                testStore.add({
                  ...t,
                  id: nextId(),
                  testMasterId: destMaster?.id,
                  programId: destination.programId,
                  yearGroupId: destination.yearGroupId,
                });
              });
              toast(`${selectedTests.length} test(s) copied.`, "success");
              setSelected(new Set());
            }}
          />
        </div>

        <div className="card-pad" style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <div className="filter-field">
            <label>
              Academic Year<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.academicYearId ?? ""}
              onChange={(e) => setDraft({ ...draft, academicYearId: e.target.value ? Number(e.target.value) : null })}
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          <CascadingClassPicker
            programId={draft.programId}
            yearGroupId={draft.yearGroupId}
            rollGroupId={draft.rollGroupId}
            onChange={(next) => setDraft({ ...draft, programId: next.programId, yearGroupId: next.yearGroupId, rollGroupId: next.rollGroupId })}
            labels={{ program: "Program *", yearGroup: "Class *" }}
          />
          <Button variant="link" onClick={handleClearSearch}>
            Clear Search
          </Button>
          <Button variant="primary" onClick={handleGo}>
            Go
          </Button>
        </div>

        <DataTable
          bare
          rowKey={(t) => t.id}
          rows={rows}
          emptyMessage="No test instances for this selection."
          leadingHeader={<input type="checkbox" disabled />}
          renderLeading={(t) => <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />}
          actionsSortDecoration
          columns={[
            { key: "name", header: "Test Name", sortable: true },
            { key: "academicYearName", header: "Academic Year", sortable: true },
            { key: "programName", header: "Program", sortable: true },
            { key: "className", header: "Class", sortable: true },
          ]}
          renderActions={(t) => (
            <>
              <EditIconButton href={`/academics/tests/instances/${t.id}/edit`} />
              <DeleteConfirmButton
                iconOnly
                itemLabel={t.name}
                onConfirm={() => {
                  testStore.remove(t.id);
                  toast("Test instance deleted.", "success");
                }}
              />
            </>
          )}
        />
      </div>
    </AcademicListPage>
  );
}
