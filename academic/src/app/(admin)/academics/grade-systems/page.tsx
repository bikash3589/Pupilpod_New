"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { GearIcon } from "@/components/ui/icons";
import { useListStore } from "@/lib/mock/createListStore";
import { gradeSystemStore, gradeBandStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { GradeSystem } from "@/types/academics";

const empty = { name: "", code: "" };

export default function GradeSystemsPage() {
  const gradeSystems = useListStore(gradeSystemStore);
  const { toast } = useToast();
  const [modal, setModal] = useState<GradeSystem | "new" | null>(null);
  const [form, setForm] = useState(empty);

  function openAdd() {
    setForm(empty);
    setModal("new");
  }
  function openEdit(g: GradeSystem) {
    setForm({ name: g.name, code: g.code });
    setModal(g);
  }

  function handleSubmit() {
    if (!form.name.trim() || form.name.length > 40) {
      toast("Name is required (max 40 characters).", "error");
      return;
    }
    if (!form.code.trim() || form.code.length > 30) {
      toast("Code is required (max 30 characters).", "error");
      return;
    }
    if (modal && modal !== "new") {
      gradeSystemStore.update(modal.id, form);
      toast("Grade system updated.", "success");
    } else {
      gradeSystemStore.add({ id: nextId(), name: form.name, code: form.code, passFailCondition: "Marks" });
      toast("Grade system added.", "success");
    }
    setModal(null);
  }

  return (
    <AcademicListPage title="Manage Grading System" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Grading System" }]}>
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Manage Grade System</div>
        </div>
        <div className="card-pad" style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 0 }}>
          <Button variant="primary" onClick={openAdd}>
            Add
          </Button>
        </div>
        <DataTable
          bare
          rowKey={(g) => g.id}
          rows={gradeSystems}
          showSerial
          serialHeader="Sl No"
          actionsSortDecoration
          columns={[
            { key: "name", header: "Grade System Name", sortable: true },
            { key: "code", header: "Grade System Code", sortable: true },
          ]}
          renderActions={(g) => (
            <>
              <EditIconButton onClick={() => openEdit(g)} />
              <DeleteConfirmButton
                iconOnly
                itemLabel={g.name}
                onConfirm={() => {
                  gradeSystemStore.remove(g.id);
                  gradeBandStore.removeMany(gradeBandStore.getSnapshot().filter((b) => b.gradeSystemId === g.id).map((b) => b.id));
                  toast("Grade system deleted.", "success");
                }}
              />
              <Link href={`/academics/grade-systems/${g.id}/configure`} className="icon-btn" title="Grade Configure" aria-label="Grade Configure">
                <GearIcon />
              </Link>
            </>
          )}
        />
      </div>

      <Modal open={!!modal} title={modal && modal !== "new" ? "Edit Grade System" : "Add Grade System"} onClose={() => setModal(null)}>
        <div className="field">
          <label>
            Name<span className="req">*</span>
          </label>
          <input className="input" maxLength={40} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>
            Code<span className="req">*</span>
          </label>
          <input className="input" maxLength={30} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
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
