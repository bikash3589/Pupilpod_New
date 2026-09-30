"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchStore } from "@/lib/mock/academics/stores";
import { programs, yearGroups, yearGroupsForProgram } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { Sketch } from "@/types/academics";

export default function EditSketchPage(props: PageProps<"/academics/sketches/[id]/edit">) {
  const { id } = use(props.params);
  const sketchId = Number(id);
  const sketches = useListStore(sketchStore);
  const sketch = sketches.find((s) => s.id === sketchId);
  return <EditSketchForm key={JSON.stringify(sketch)} sketchId={sketchId} sketch={sketch} />;
}

function EditSketchForm({ sketchId, sketch }: { sketchId: number; sketch: Sketch | undefined }) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(sketch?.sketchName ?? "");
  const [code, setCode] = useState(sketch?.sketchCode ?? "");
  const [programIds, setProgramIds] = useState<number[]>(sketch?.programIds ?? []);
  const [yearGroupIds, setYearGroupIds] = useState<number[]>(sketch?.yearGroupIds ?? []);

  if (!sketch) {
    return (
      <AcademicListPage title="Edit Sketch" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Sketches", href: "/academics/sketches" }, { label: "Edit" }]}>
        <div className="empty-state">Sketch not found.</div>
      </AcademicListPage>
    );
  }

  const availableYearGroups = programIds.flatMap((pid) => yearGroupsForProgram(pid));

  return (
    <AcademicListPage
      title={`Edit Sketch — ${sketch.sketchName}`}
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Sketches", href: "/academics/sketches" }, { label: "Edit" }]}
    >
      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <div className="field-row">
          <div className="field">
            <label>Sketch Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Sketch Code</label>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Programs</label>
          <div className="multiselect">
            {programs.map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={programIds.includes(p.id)}
                  onChange={(e) => setProgramIds(e.target.checked ? [...programIds, p.id] : programIds.filter((id) => id !== p.id))}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Classes</label>
          <div className="multiselect">
            {availableYearGroups.map((yg) => (
              <label key={yg.id}>
                <input
                  type="checkbox"
                  checked={yearGroupIds.includes(yg.id)}
                  onChange={(e) => setYearGroupIds(e.target.checked ? [...yearGroupIds, yg.id] : yearGroupIds.filter((id) => id !== yg.id))}
                />
                {yearGroups.find((y) => y.id === yg.id)?.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => router.push("/academics/sketches")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              sketchStore.update(sketchId, { sketchName: name, sketchCode: code, programIds, yearGroupIds });
              toast("Sketch updated.", "success");
              router.push("/academics/sketches");
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </AcademicListPage>
  );
}
