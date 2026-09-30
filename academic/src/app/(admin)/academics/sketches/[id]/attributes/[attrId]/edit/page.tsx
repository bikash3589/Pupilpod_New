"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import SketchAttributeForm, { SketchAttributeDraft } from "@/components/academics/SketchAttributeForm";
import { sketchAttributeStore } from "@/lib/mock/academics/stores";
import { useListStore } from "@/lib/mock/createListStore";
import { useToast } from "@/components/ui/Toast";
import { SketchAttribute } from "@/types/academics";

export default function EditSketchAttributePage(props: PageProps<"/academics/sketches/[id]/attributes/[attrId]/edit">) {
  const { id, attrId } = use(props.params);
  const attributeId = Number(attrId);
  const attributes = useListStore(sketchAttributeStore);
  const attr = attributes.find((a) => a.id === attributeId);
  return <EditSketchAttributeForm key={JSON.stringify(attr)} sketchId={Number(id)} attributeId={attributeId} attr={attr} />;
}

function EditSketchAttributeForm({
  sketchId,
  attributeId,
  attr,
}: {
  sketchId: number;
  attributeId: number;
  attr: SketchAttribute | undefined;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [draft, setDraft] = useState<SketchAttributeDraft | null>(() =>
    attr
      ? {
          attributeName: attr.attributeName,
          attributeCategory: attr.attributeCategory,
          attributeType: attr.attributeType,
          position: attr.position,
          gradeSystemId: attr.gradeSystemId,
          finalFormula: attr.finalFormula,
          canUseForRank: attr.canUseForRank,
        }
      : null
  );

  if (!draft) {
    return (
      <AcademicListPage title="Edit Attribute" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Sketches", href: "/academics/sketches" }, { label: "Attributes", href: `/academics/sketches/${sketchId}/attributes` }, { label: "Edit" }]}>
        <div className="empty-state">Attribute not found.</div>
      </AcademicListPage>
    );
  }

  return (
    <AcademicListPage
      title={`Edit Attribute — ${draft.attributeName}`}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Sketches", href: "/academics/sketches" },
        { label: "Attributes", href: `/academics/sketches/${sketchId}/attributes` },
        { label: "Edit" },
      ]}
    >
      <div className="card card-pad" style={{ maxWidth: 720 }}>
        <SketchAttributeForm value={draft} onChange={setDraft} />
        <div className="form-actions">
          <Button variant="secondary" onClick={() => router.push(`/academics/sketches/${sketchId}/attributes`)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              sketchAttributeStore.update(attributeId, {
                attributeName: draft.attributeName,
                attributeCategory: draft.attributeCategory,
                attributeType: draft.attributeType,
                position: draft.position,
                gradeSystemId: draft.gradeSystemId ?? undefined,
                finalFormula: draft.finalFormula,
                canUseForRank: draft.canUseForRank,
              });
              toast("Attribute updated.", "success");
              router.push(`/academics/sketches/${sketchId}/attributes`);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </AcademicListPage>
  );
}
