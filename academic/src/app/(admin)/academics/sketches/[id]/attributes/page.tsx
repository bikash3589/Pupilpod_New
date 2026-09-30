"use client";

import { use, useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import SketchAttributeForm, { SketchAttributeDraft } from "@/components/academics/SketchAttributeForm";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchStore, sketchAttributeStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

const emptyDraft: SketchAttributeDraft = {
  attributeName: "",
  attributeCategory: "Entity",
  attributeType: "",
  position: 1,
  canUseForRank: false,
};

export default function SketchAttributesPage(props: PageProps<"/academics/sketches/[id]/attributes">) {
  const { id } = use(props.params);
  const sketchId = Number(id);
  const sketches = useListStore(sketchStore);
  const attributes = useListStore(sketchAttributeStore).filter((a) => a.sketchId === sketchId).sort((a, b) => a.position - b.position);
  const sketch = sketches.find((s) => s.id === sketchId);
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<SketchAttributeDraft>(emptyDraft);

  function handleAdd() {
    if (!draft.attributeName.trim()) {
      toast("Attribute Name is required.", "error");
      return;
    }
    sketchAttributeStore.add({
      id: nextId(),
      sketchId,
      attributeName: draft.attributeName,
      attributeCategory: draft.attributeCategory,
      attributeType: draft.attributeType,
      position: draft.position,
      gradeSystemId: draft.gradeSystemId ?? undefined,
      finalFormula: draft.finalFormula,
      canUseForRank: draft.canUseForRank,
    });
    toast("Attribute added.", "success");
    setDraft({ ...emptyDraft, position: attributes.length + 2 });
    setShowAdd(false);
  }

  return (
    <AcademicListPage
      title={`Attributes — ${sketch?.sketchName ?? ""}`}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Sketches", href: "/academics/sketches" },
        { label: "Attributes" },
      ]}
      actions={
        <Button variant="primary" size="sm" onClick={() => { setDraft({ ...emptyDraft, position: attributes.length + 1 }); setShowAdd((v) => !v); }}>
          {showAdd ? "Close" : "Add"}
        </Button>
      }
    >
      {showAdd && (
        <div className="card card-pad mt-16" style={{ marginBottom: 16 }}>
          <div className="section-title">New Attribute</div>
          <SketchAttributeForm value={draft} onChange={setDraft} />
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              Add Attribute
            </Button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Attribute Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Rank</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((a) => (
                <tr key={a.id}>
                  <td>{a.position}</td>
                  <td>{a.attributeName}</td>
                  <td>
                    <span className="badge badge-primary">{a.attributeCategory}</span>
                  </td>
                  <td>{a.attributeType || "—"}</td>
                  <td>{a.canUseForRank ? <span className="badge badge-success">Yes</span> : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/academics/sketches/${sketchId}/attributes/${a.id}/edit`} className="btn btn-secondary btn-sm">
                        Edit
                      </Link>
                      <DeleteConfirmButton
                        itemLabel={a.attributeName}
                        onConfirm={() => {
                          sketchAttributeStore.remove(a.id);
                          toast("Attribute deleted.", "success");
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {attributes.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">No attributes configured yet.</div>
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
