"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import { useListStore } from "@/lib/mock/createListStore";
import { testMasterStore } from "@/lib/mock/academics/stores";
import { academicYears } from "@/lib/mock/academics/lookups";

const currentYearId = academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0]?.id ?? null;

export default function BulkUpdateSelectorPage() {
  const testMasters = useListStore(testMasterStore);
  const router = useRouter();

  const [draftYearId, setDraftYearId] = useState<number | null>(currentYearId);
  const [appliedYearId, setAppliedYearId] = useState<number | null>(currentYearId);
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

  function handleUpdate() {
    if (selected.size !== 1) return;
    const [id] = selected;
    router.push(`/academics/tests/bulk-update/${id}`);
  }

  const rows = testMasters
    .filter((tm) => !appliedYearId || tm.academicYearId === appliedYearId)
    .map((tm) => ({ ...tm, academicYearName: academicYears.find((y) => y.id === tm.academicYearId)?.name ?? "—" }));

  return (
    <AcademicListPage title="Manage Test" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Test" }]}>
      <div className="card">
        <div className="card-pad" style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={selected.size !== 1}
            disabledReason={selected.size === 0 ? "Select a Test to update." : "Select only one Test to update."}
          >
            Update
          </Button>
          <div className="filter-field">
            <label>
              Academic Year<span className="req">*</span>
            </label>
            <select className="select" value={draftYearId ?? ""} onChange={(e) => setDraftYearId(e.target.value ? Number(e.target.value) : null)}>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={() => setAppliedYearId(draftYearId)}>
            Go
          </Button>
        </div>

        <DataTable
          bare
          rowKey={(tm) => tm.id}
          rows={rows}
          emptyMessage="No tests for this Academic Year."
          leadingHeader={<input type="checkbox" disabled />}
          renderLeading={(tm) => <input type="checkbox" checked={selected.has(tm.id)} onChange={() => toggle(tm.id)} />}
          columns={[
            { key: "name", header: "Name", sortable: true },
            { key: "code", header: "Test Code", sortable: true },
            { key: "academicYearName", header: "Academic Year", sortable: true },
          ]}
        />
      </div>
    </AcademicListPage>
  );
}
