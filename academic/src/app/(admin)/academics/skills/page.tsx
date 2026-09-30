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
import { skillStore, subjectSkillMappingStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { Skill } from "@/types/academics";

const empty = { name: "", code: "", description: "" };

export default function SkillsPage() {
  const skills = useListStore(skillStore);
  const subjectSkillMappings = useListStore(subjectSkillMappingStore);
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<Skill | "new" | null>(null);
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
  function openEdit(s: Skill) {
    setForm({ name: s.name, code: s.code, description: s.description ?? "" });
    setModal(s);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.code.trim()) {
      toast("Name and Code are required.", "error");
      return;
    }
    if (modal && modal !== "new") {
      skillStore.update(modal.id, { name: form.name, code: form.code, description: form.description });
      toast("Skill updated.", "success");
    } else {
      skillStore.add({ id: nextId(), name: form.name, code: form.code, description: form.description });
      toast("Skill added.", "success");
    }
    setModal(null);
  }

  return (
    <AcademicListPage title="Manage Skills" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Skills" }]}>
      <DataTable
        rowKey={(s) => s.id}
        rows={skills}
        headerActions={
          <>
            <Button variant="primary" size="sm" onClick={openAdd}>
              Add
            </Button>
            <BulkActionsBar
              selectedCount={selected.size}
              onBulkDelete={() => {
                skillStore.removeMany([...selected]);
                setSelected(new Set());
                toast("Selected skills deleted.", "success");
              }}
            />
            <ImportExportButtons
              entityLabel="Skill"
              templateColumns={["Name", "Code", "Description"]}
              templateFilename="skills-template.csv"
              onImport={(rows) =>
                rows.forEach((row) =>
                  skillStore.add({ id: nextId(), name: row["Name"] ?? "Untitled", code: row["Code"] ?? `SK-${nextId()}`, description: row["Description"] })
                )
              }
            />
            <ExportExcelButton
              rows={skills.filter((s) => selected.size === 0 || selected.has(s.id))}
              columns={[
                { key: "name", header: "Name" },
                { key: "code", header: "Code" },
                { key: "description", header: "Description" },
              ]}
              filename="skills.csv"
            />
          </>
        }
        leadingHeader={<input type="checkbox" disabled />}
        renderLeading={(s) => <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />}
        showSerial
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "code", header: "Code", sortable: true },
          { key: "description", header: "Description" },
        ]}
        renderActions={(s) => (
          <>
            <EditIconButton onClick={() => openEdit(s)} />
            <DeleteConfirmButton
              iconOnly
              itemLabel={s.name}
              disabled={subjectSkillMappings.some((m) => m.skillId === s.id)}
              disabledReason="This Skill has been mapped to a Subject."
              onConfirm={() => {
                skillStore.remove(s.id);
                toast("Skill deleted.", "success");
              }}
            />
          </>
        )}
      />

      <Modal open={!!modal} title={modal && modal !== "new" ? "Edit Skill" : "Add Skill"} onClose={() => setModal(null)}>
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
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
