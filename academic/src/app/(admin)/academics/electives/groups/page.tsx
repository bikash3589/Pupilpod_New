"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import CopyToDestinationModal from "@/components/academics/buttons/CopyToDestinationModal";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { electiveGroupStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface Query {
  programId: number;
  yearGroupId: number;
}

export default function ElectiveGroupsPage() {
  const groups = useListStore(electiveGroupStore);
  const { toast } = useToast();
  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);
  const [query, setQuery] = useState<Query | null>(null);
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
    if (!programId || !yearGroupId) return;
    setQuery({ programId, yearGroupId });
    setSelected(new Set());
  }

  const rows = query ? groups.filter((g) => g.programId === query.programId && g.yearGroupId === query.yearGroupId) : [];
  const selectedGroups = rows.filter((g) => selected.has(g.id));

  return (
    <AcademicListPage title="Manage Elective Group" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Elective Group" }]}>
      <div className="filter-bar">
        <CascadingClassPicker
          programId={programId}
          yearGroupId={yearGroupId}
          onChange={(next) => {
            setProgramId(next.programId);
            setYearGroupId(next.yearGroupId);
            setQuery(null);
            setSelected(new Set());
          }}
          showSection={false}
          labels={{ program: "Program *", yearGroup: "Class *" }}
        />
        <Button variant="primary" onClick={handleGo} disabled={!programId || !yearGroupId} disabledReason="Select a Program and Class first.">
          Go
        </Button>
        <CopyToDestinationModal
          sourceLabel={selectedGroups.map((g) => g.name).join(", ")}
          disabled={selectedGroups.length === 0}
          disabledReason="Select at least one Elective Group to copy."
          onCopy={(destination) => {
            selectedGroups.forEach((g) => {
              electiveGroupStore.add({
                ...g,
                id: nextId(),
                academicYearId: destination.academicYearId,
                programId: destination.programId,
                yearGroupId: destination.yearGroupId,
              });
            });
            toast(`${selectedGroups.length} elective group(s) copied.`, "success");
            setSelected(new Set());
          }}
        />
      </div>

      <div className="page-actions" style={{ justifyContent: "flex-end" }}>
        {yearGroupId ? (
          <Link href={`/academics/electives/groups/new?programId=${programId}&yearGroupId=${yearGroupId}`} className="btn btn-primary">
            Add
          </Link>
        ) : (
          <Button variant="primary" disabled disabledReason="Select a Class first.">
            Add
          </Button>
        )}
      </div>

      <DataTable
        rowKey={(g) => g.id}
        rows={rows}
        emptyMessage="No elective groups for this selection."
        leadingHeader={<input type="checkbox" disabled />}
        renderLeading={(g) => <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggle(g.id)} />}
        actionsSortDecoration
        columns={[
          { key: "name", header: "Elective Group Name", sortable: true },
          { key: "orderNo", header: "Order Number", sortable: true },
          { key: "minSelection", header: "Min Selection", sortable: true },
          { key: "maxSelection", header: "Max Selection", sortable: true },
        ]}
        renderActions={(g) => (
          <>
            <EditIconButton href={`/academics/electives/groups/${g.id}/edit`} />
            <DeleteConfirmButton
              iconOnly
              itemLabel={g.name}
              onConfirm={() => {
                electiveGroupStore.remove(g.id);
                toast("Elective group deleted.", "success");
              }}
            />
          </>
        )}
      />
    </AcademicListPage>
  );
}
