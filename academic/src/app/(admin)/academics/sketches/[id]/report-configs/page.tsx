"use client";

import { use, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchStore, sketchReportConfigStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

const empty = { name: "", code: "", description: "" };

export default function SketchReportConfigsPage(props: PageProps<"/academics/sketches/[id]/report-configs">) {
  const { id } = use(props.params);
  const sketchId = Number(id);
  const sketches = useListStore(sketchStore);
  const configs = useListStore(sketchReportConfigStore).filter((c) => c.sketchId === sketchId);
  const sketch = sketches.find((s) => s.id === sketchId);
  const { toast } = useToast();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  return (
    <AcademicListPage
      title={`Report Configurations — ${sketch?.sketchName ?? ""}`}
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Sketches", href: "/academics/sketches" }, { label: "Report Configurations" }]}
      actions={
        <Button variant="primary" size="sm" onClick={() => setModal(true)}>
          Add
        </Button>
      }
    >
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.code ?? "—"}</td>
                  <td>{c.description ?? "—"}</td>
                  <td>
                    <DeleteConfirmButton
                      itemLabel={c.name}
                      onConfirm={() => {
                        sketchReportConfigStore.remove(c.id);
                        toast("Report configuration deleted.", "success");
                      }}
                    />
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No report configurations yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} title="Add Report Configuration" onClose={() => setModal(false)}>
        <div className="field">
          <label>Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Code</label>
          <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!form.name.trim()) {
                toast("Name is required.", "error");
                return;
              }
              sketchReportConfigStore.add({ id: nextId(), sketchId, ...form });
              setModal(false);
              setForm(empty);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </AcademicListPage>
  );
}
