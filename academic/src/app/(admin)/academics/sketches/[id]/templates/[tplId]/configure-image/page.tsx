"use client";

import { use, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchTemplateStore } from "@/lib/mock/academics/stores";
import { useToast } from "@/components/ui/Toast";

interface ImageConfigRow {
  id: number;
  x: number;
  y: number;
  pageNo: number;
  width: number;
  height: number;
  imageType: "image" | "grade_image";
}

let localId = 1;

export default function ConfigureImagePage(props: PageProps<"/academics/sketches/[id]/templates/[tplId]/configure-image">) {
  const { tplId } = use(props.params);
  const templates = useListStore(sketchTemplateStore);
  const template = templates.find((t) => t.id === Number(tplId));
  const { toast } = useToast();

  const [rows, setRows] = useState<ImageConfigRow[]>([]);
  const [draft, setDraft] = useState<Omit<ImageConfigRow, "id">>({ x: 0, y: 0, pageNo: 1, width: 100, height: 100, imageType: "image" });

  return (
    <AcademicListPage
      title={`Configure Image Placement — ${template?.name ?? ""}`}
      subtitle="Save/Delete for this screen had no confirmed click handler in the legacy source (see ACADEMIC_FRONTEND_PLAN.md Section 2.2) — wired here with straightforward client state."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Sketches", href: "/academics/sketches" }, { label: "Configure Image" }]}
    >
      <div className="card card-pad mt-16" style={{ marginBottom: 16, maxWidth: 640 }}>
        <div className="section-title">New Placement</div>
        <div className="field-row">
          <div className="field">
            <label>X</label>
            <input className="input" type="number" value={draft.x} onChange={(e) => setDraft({ ...draft, x: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Y</label>
            <input className="input" type="number" value={draft.y} onChange={(e) => setDraft({ ...draft, y: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Page No</label>
            <input className="input" type="number" value={draft.pageNo} onChange={(e) => setDraft({ ...draft, pageNo: Number(e.target.value) })} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Width</label>
            <input className="input" type="number" value={draft.width} onChange={(e) => setDraft({ ...draft, width: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Height</label>
            <input className="input" type="number" value={draft.height} onChange={(e) => setDraft({ ...draft, height: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Image Type</label>
            <select className="select" value={draft.imageType} onChange={(e) => setDraft({ ...draft, imageType: e.target.value as ImageConfigRow["imageType"] })}>
              <option value="image">Image</option>
              <option value="grade_image">Grade Image</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <Button
            variant="primary"
            onClick={() => {
              setRows((prev) => [...prev, { id: localId++, ...draft }]);
              toast("Placement saved.", "success");
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>X</th>
                <th>Y</th>
                <th>Page</th>
                <th>Width</th>
                <th>Height</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.x}</td>
                  <td>{r.y}</td>
                  <td>{r.pageNo}</td>
                  <td>{r.width}</td>
                  <td>{r.height}</td>
                  <td>{r.imageType}</td>
                  <td>
                    <DeleteConfirmButton
                      itemLabel="this placement"
                      onConfirm={() => {
                        setRows((prev) => prev.filter((row) => row.id !== r.id));
                        toast("Placement deleted.", "success");
                      }}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">No image placements configured yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AcademicListPage>
  );
}
