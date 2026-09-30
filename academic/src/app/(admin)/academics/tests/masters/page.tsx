"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import CopyToDestinationModal from "@/components/academics/buttons/CopyToDestinationModal";
import { useListStore } from "@/lib/mock/createListStore";
import { testMasterStore } from "@/lib/mock/academics/stores";
import { academicYears, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { TestMaster } from "@/types/academics";

const empty = { name: "", code: "" };

export default function TestMastersPage() {
  const testMasters = useListStore(testMasterStore);
  const { toast } = useToast();
  const [modal, setModal] = useState<TestMaster | "new" | null>(null);
  const [form, setForm] = useState(empty);
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

  function openAdd() {
    setForm(empty);
    setModal("new");
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.code.trim()) {
      toast("Name and Code are required.", "error");
      return;
    }
    testMasterStore.add({ id: nextId(), name: form.name, code: form.code, academicYearId: academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0].id });
    toast("Test master created.", "success");
    setModal(null);
  }

  const rows = testMasters.map((tm) => ({
    ...tm,
    academicYearName: academicYears.find((y) => y.id === tm.academicYearId)?.name ?? "—",
  }));
  const selectedMasters = testMasters.filter((tm) => selected.has(tm.id));

  return (
    <AcademicListPage title="Manage Test Home" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Test Home" }]}>
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Manage Test Home</div>
        </div>
        <div className="card-pad" style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingBottom: 0 }}>
          <Button variant="primary" size="sm" onClick={openAdd}>
            Add
          </Button>
          <CopyToDestinationModal
            sourceLabel={selectedMasters.map((tm) => tm.name).join(", ")}
            disabled={selectedMasters.length === 0}
            disabledReason="Select at least one Test to copy."
            onCopy={(destination) => {
              selectedMasters.forEach((tm) => {
                testMasterStore.add({ id: nextId(), name: tm.name, code: tm.code, academicYearId: destination.academicYearId });
              });
              toast(`${selectedMasters.length} test(s) copied.`, "success");
              setSelected(new Set());
            }}
          />
        </div>
        <DataTable
          bare
          rowKey={(tm) => tm.id}
          rows={rows}
          leadingHeader={<input type="checkbox" disabled />}
          renderLeading={(tm) => <input type="checkbox" checked={selected.has(tm.id)} onChange={() => toggle(tm.id)} />}
          actionsSortDecoration
          columns={[
            {
              key: "name",
              header: "Name",
              sortable: true,
              render: (tm) => (
                <Link href={`/academics/tests/masters/${tm.id}/create-tests`} className="btn-link">
                  {tm.name}
                </Link>
              ),
            },
            { key: "code", header: "Test Code", sortable: true },
            { key: "academicYearName", header: "Academic Year", sortable: true },
          ]}
          renderActions={(tm) => (
            <>
              <EditIconButton href={`/academics/tests/masters/${tm.id}/edit`} />
              <DeleteConfirmButton
                iconOnly
                itemLabel={tm.name}
                onConfirm={() => {
                  testMasterStore.remove(tm.id);
                  toast("Test master deleted.", "success");
                }}
              />
            </>
          )}
        />
      </div>

      <Modal open={!!modal} title="Add Test Master" onClose={() => setModal(null)}>
        <div className="field">
          <label>
            Name<span className="req">*</span>
          </label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>
            Code<span className="req">*</span>
          </label>
          <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </Modal>
    </AcademicListPage>
  );
}
