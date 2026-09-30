"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { subjectTypeStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { SubjectType } from "@/types/academics";

export default function SubjectTypesPage() {
  const subjectTypes = useListStore(subjectTypeStore);
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: SubjectType } | null>(null);
  const [name, setName] = useState("");

  function openAdd() {
    setName("");
    setModal({ mode: "add" });
  }

  function openEdit(item: SubjectType) {
    setName(item.name);
    setModal({ mode: "edit", item });
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Name is required.", "error");
      return;
    }
    if (subjectTypes.some((s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.id !== modal?.item?.id)) {
      toast("A subject type with this name already exists.", "error");
      return;
    }
    if (modal?.mode === "edit" && modal.item) {
      subjectTypeStore.update(modal.item.id, { name: trimmed });
      toast("Subject type updated.", "success");
    } else {
      subjectTypeStore.add({ id: nextId(), name: trimmed });
      toast("Subject type added.", "success");
    }
    setModal(null);
  }

  const rows = subjectTypes.map((s, i) => ({ ...s, slNo: i + 1 }));

  return (
    <AcademicListPage
      title="Manage Subject Type"
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Subject Type" }]}
    >
      <DataTable
        rowKey={(r) => r.id}
        rows={rows}
        headerActions={
          <Button variant="primary" onClick={openAdd}>
            Add
          </Button>
        }
        columns={[
          { key: "slNo", header: "SI No", sortable: true, align: "left" },
          { key: "name", header: "Name", sortable: true },
        ]}
        renderActions={(s) => (
          <>
            <EditIconButton onClick={() => openEdit(s)} />
            <DeleteConfirmButton
              iconOnly
              itemLabel={s.name}
              onConfirm={() => {
                subjectTypeStore.remove(s.id);
                toast("Subject type deleted.", "success");
              }}
            />
          </>
        )}
      />

      <Modal open={!!modal} title={modal?.mode === "edit" ? "Edit Subject Type" : "Add Subject Type"} onClose={() => setModal(null)}>
        <div className="field">
          <label>
            Name<span className="req">*</span>
          </label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
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
