"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { remarkStore, departmentStore, skillStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { Remark } from "@/types/academics";

const empty = { remarkCode: "", description: "", departmentIds: [] as number[], skillId: "" as number | "" };

export default function RemarksPage() {
  const remarks = useListStore(remarkStore);
  const departments = useListStore(departmentStore);
  const skills = useListStore(skillStore);
  const { toast } = useToast();
  const [modal, setModal] = useState<Remark | "new" | null>(null);
  const [form, setForm] = useState(empty);

  function openAdd() {
    setForm(empty);
    setModal("new");
  }
  function openEdit(r: Remark) {
    setForm({ remarkCode: r.remarkCode, description: r.description, departmentIds: r.departmentId ? [r.departmentId] : [], skillId: r.skillId ?? "" });
    setModal(r);
  }

  function handleSubmit() {
    if (!form.remarkCode.trim() || !form.description.trim()) {
      toast("Remark Code and Description are required.", "error");
      return;
    }
    if (form.departmentIds.length === 0) {
      toast("Select at least one subject.", "error");
      return;
    }
    if (modal && modal !== "new") {
      remarkStore.update(modal.id, {
        remarkCode: form.remarkCode,
        description: form.description,
        departmentId: form.departmentIds[0],
        skillId: form.skillId || undefined,
      });
      form.departmentIds.slice(1).forEach((departmentId) => {
        remarkStore.add({ id: nextId(), remarkCode: form.remarkCode, description: form.description, departmentId, skillId: form.skillId || undefined });
      });
      toast("Remark updated.", "success");
    } else {
      form.departmentIds.forEach((departmentId) => {
        remarkStore.add({ id: nextId(), remarkCode: form.remarkCode, description: form.description, departmentId, skillId: form.skillId || undefined });
      });
      toast(`${form.departmentIds.length} remark(s) added.`, "success");
    }
    setModal(null);
  }

  const rows = remarks.map((r) => ({
    ...r,
    subjectName: departments.find((d) => d.id === r.departmentId)?.name ?? "—",
    skillName: skills.find((s) => s.id === r.skillId)?.name ?? "—",
  }));

  return (
    <AcademicListPage title="Manage Remarks" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Remarks" }]}>
      <DataTable
        rowKey={(r) => r.id}
        rows={rows}
        headerActions={
          <Button variant="primary" onClick={openAdd}>
            Add
          </Button>
        }
        columns={[
          { key: "remarkCode", header: "Code", sortable: true },
          { key: "description", header: "Description" },
          { key: "subjectName", header: "Subject", sortable: true },
          { key: "skillName", header: "Skill", sortable: true },
        ]}
        renderActions={(r) => (
          <>
            <EditIconButton onClick={() => openEdit(r)} />
            <DeleteConfirmButton
              itemLabel={r.remarkCode}
              iconOnly
              onConfirm={() => {
                remarkStore.remove(r.id);
                toast("Remark deleted.", "success");
              }}
            />
          </>
        )}
      />

      <Modal open={!!modal} title={modal && modal !== "new" ? "Edit Remark" : "Add Remark"} onClose={() => setModal(null)}>
        <div className="field">
          <label>
            Remark Code<span className="req">*</span>
          </label>
          <input className="input" value={form.remarkCode} onChange={(e) => setForm({ ...form, remarkCode: e.target.value })} />
        </div>
        <div className="field">
          <label>
            Description<span className="req">*</span>
          </label>
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="field">
          <label>
            Subjects<span className="req">*</span>
          </label>
          <div className="multiselect">
            {departments.map((d) => (
              <label key={d.id}>
                <input
                  type="checkbox"
                  checked={form.departmentIds.includes(d.id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      departmentIds: e.target.checked ? [...form.departmentIds, d.id] : form.departmentIds.filter((id) => id !== d.id),
                    })
                  }
                />
                {d.name}
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Skill</label>
          <select className="select" value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value ? Number(e.target.value) : "" })}>
            <option value="">None</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
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
