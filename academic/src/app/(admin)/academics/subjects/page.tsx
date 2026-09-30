"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import ImportExportButtons from "@/components/academics/buttons/ImportExportButtons";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { useToast } from "@/components/ui/Toast";
import { useListStore } from "@/lib/mock/createListStore";
import { departmentStore, assignedSubjectStore } from "@/lib/mock/academics/stores";
import { departmentTypes } from "@/lib/mock/academics/subjects";
import { nextId } from "@/lib/mock/academics/lookups";

export default function SubjectsListPage() {
  const departments = useListStore(departmentStore);
  const assignedSubjects = useListStore(assignedSubjectStore);
  const { toast } = useToast();

  const [pendingType, setPendingType] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedName, setAppliedName] = useState("");

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filtered = useMemo(
    () =>
      departments.filter(
        (d) =>
          (!appliedType || d.type === appliedType) &&
          (!appliedName || d.name.toLowerCase().includes(appliedName.toLowerCase()))
      ),
    [departments, appliedType, appliedName]
  );

  function toggleRow(id: number) {
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

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id))));
  }

  function isReferenced(id: number) {
    return assignedSubjects.some((a) => a.kind === "Core" && a.departmentId === id);
  }

  function handleGo() {
    setAppliedType(pendingType);
    setAppliedName(pendingName);
  }

  function handleClearSearch() {
    setPendingType("");
    setPendingName("");
    setAppliedType("");
    setAppliedName("");
  }

  function handleBulkDelete() {
    if (selected.size === 0) {
      toast("Please select at least one subject.", "error");
      return;
    }
    setConfirmBulkDelete(true);
  }

  return (
    <AcademicListPage title="Manage Subjects" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Subjects" }]}>
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="section-title">Subjects</div>
          <div className="flex gap-16" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="field" style={{ minWidth: 220 }}>
              <label>Type</label>
              <select className="select" value={pendingType} onChange={(e) => setPendingType(e.target.value)}>
                <option value="">Select Type</option>
                {departmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 320 }}>
              <label>Subject Name</label>
              <div className="flex gap-8">
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Search by Subject Name"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                />
                <Button variant="link" onClick={handleClearSearch}>
                  Clear Search
                </Button>
                <Button variant="primary" onClick={handleGo}>
                  Go
                </Button>
              </div>
            </div>
          </div>

          <div className="page-actions" style={{ justifyContent: "flex-end", marginBottom: 16 }}>
            <Link href="/academics/subjects/assign" className="btn btn-secondary">
              Assign Subjects to class
            </Link>
            <Link href="/academics/subjects/new" className="btn btn-secondary">
              Add Subject
            </Link>
            <Button variant="secondary" onClick={handleBulkDelete}>
              Bulk Delete
            </Button>
            <ImportExportButtons
              entityLabel="Subject"
              templateColumns={["Subject Type", "Subject Name", "Subject Code"]}
              templateFilename="subjects-template.csv"
              onImport={(rows) => {
                rows.forEach((row) => {
                  departmentStore.add({
                    id: nextId(),
                    name: row["Subject Name"] || "Untitled Subject",
                    type: (row["Subject Type"] as never) || "Learning Area",
                    subjectCode: row["Subject Code"],
                    sectionIds: [],
                  });
                });
              }}
            />
            <ExportExcelButton
              rows={filtered}
              columns={[
                { key: "name", header: "Name" },
                { key: "type", header: "Type" },
                { key: "subjectCode", header: "Subject Code" },
              ]}
              filename="subjects.csv"
            />
          </div>
        </div>

        <DataTable
          bare
          rowKey={(d) => d.id}
          rows={filtered}
          emptyMessage="No subjects found — try adjusting your filters or add a new subject."
          actionsSortDecoration
          leadingHeader={<input type="checkbox" checked={selected.size > 0 && selected.size === filtered.length} onChange={toggleAll} />}
          renderLeading={(d) => <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleRow(d.id)} />}
          columns={[
            {
              key: "name",
              header: "Name",
              sortable: true,
              render: (d) => (
                <Link href={`/academics/subjects/${d.id}/edit`} style={{ color: "var(--primary-dark)" }}>
                  {d.name}
                </Link>
              ),
            },
            { key: "type", header: "Type", sortable: true },
            { key: "subjectCode", header: "Subject Code", sortable: true, render: (d) => d.subjectCode ?? "—" },
          ]}
          renderActions={(d) => (
            <>
              <EditIconButton href={`/academics/subjects/${d.id}/edit`} />
              <DeleteConfirmButton
                iconOnly
                itemLabel={d.name}
                disabled={isReferenced(d.id)}
                disabledReason="This subject is assigned to a class and cannot be deleted."
                onConfirm={() => {
                  departmentStore.remove(d.id);
                  toast("Subject deleted.", "success");
                }}
              />
            </>
          )}
        />
      </div>

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Bulk delete"
        message={`Delete ${selected.size} selected subject(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => {
          setConfirmBulkDelete(false);
          const blocked = [...selected].filter(isReferenced);
          if (blocked.length > 0) {
            toast(`${blocked.length} subject(s) are assigned to a class and cannot be deleted.`, "error");
          }
          const removable = [...selected].filter((id) => !isReferenced(id));
          departmentStore.removeMany(removable);
          setSelected(new Set());
          toast(`${removable.length} subject(s) deleted.`, "success");
        }}
      />
    </AcademicListPage>
  );
}
