"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import BulkActionsBar from "@/components/academics/buttons/BulkActionsBar";
import ImportExportButtons from "@/components/academics/buttons/ImportExportButtons";
import ExportExcelButton from "@/components/academics/buttons/ExportExcelButton";
import { useListStore } from "@/lib/mock/createListStore";
import { examRoomStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { ExamRoom } from "@/types/academics";

const empty = { name: "", code: "" };

export default function ExamRoomsPage() {
  const rooms = useListStore(examRoomStore);
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ExamRoom | "new" | null>(null);
  const [form, setForm] = useState(empty);

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
  function openEdit(r: ExamRoom) {
    setForm({ name: r.name, code: r.code });
    setModal(r);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.code.trim()) {
      toast("Name and Code are required.", "error");
      return;
    }
    const clash = rooms.some(
      (r) => r.name.toLowerCase() === form.name.toLowerCase() && r.code.toLowerCase() === form.code.toLowerCase() && r.id !== (modal !== "new" ? modal?.id : undefined)
    );
    if (clash) {
      toast("A room with this Name and Code already exists.", "error");
      return;
    }
    if (modal && modal !== "new") {
      examRoomStore.update(modal.id, form);
      toast("Exam room updated.", "success");
    } else {
      examRoomStore.add({ id: nextId(), ...form });
      toast("Exam room added.", "success");
    }
    setModal(null);
  }

  return (
    <AcademicListPage title="Manage Test Room" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Test Room" }]}>
      <DataTable
        rowKey={(r) => r.id}
        rows={rooms}
        headerActions={
          <>
            <Button variant="primary" size="sm" onClick={openAdd}>
              Add
            </Button>
            <BulkActionsBar
              selectedCount={selected.size}
              requireSelectionMessage="You Have to Select Room."
              onBulkDelete={() => {
                examRoomStore.removeMany([...selected]);
                setSelected(new Set());
                toast("Selected rooms deleted.", "success");
              }}
            />
            <ImportExportButtons
              entityLabel="Exam Room"
              templateColumns={["Name", "Code"]}
              templateFilename="exam-rooms-template.csv"
              onImport={(rows) => rows.forEach((row) => examRoomStore.add({ id: nextId(), name: row["Name"] ?? "Room", code: row["Code"] ?? `RM-${nextId()}` }))}
            />
            <ExportExcelButton
              rows={rooms.filter((r) => selected.size === 0 || selected.has(r.id))}
              columns={[
                { key: "name", header: "Name" },
                { key: "code", header: "Code" },
              ]}
              filename="exam-rooms.csv"
            />
          </>
        }
        leadingHeader={<input type="checkbox" disabled />}
        renderLeading={(r) => <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />}
        showSerial
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "code", header: "Code", sortable: true },
        ]}
        renderActions={(r) => (
          <>
            <EditIconButton onClick={() => openEdit(r)} />
            <DeleteConfirmButton
              iconOnly
              itemLabel={r.name}
              onConfirm={() => {
                examRoomStore.remove(r.id);
                toast("Exam room deleted.", "success");
              }}
            />
          </>
        )}
      />

      <Modal open={!!modal} title={modal && modal !== "new" ? "Edit Exam Room" : "Add Exam Room"} onClose={() => setModal(null)}>
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
