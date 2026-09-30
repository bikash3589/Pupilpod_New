"use client";

import { use, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EditIconButton from "@/components/academics/buttons/EditIconButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { gradeSystemStore, gradeBandStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { GradeSystemConfiguration } from "@/types/academics";

const emptyBand = {
  gradeName: "",
  gradePoint: "",
  lowerLimit: "",
  upperLimit: "",
  rank: "",
  subjectStatus: "Pass" as "Pass" | "Fail",
  classObtained: "" as GradeSystemConfiguration["classObtained"] | "",
  description: "",
  gradeUniqueNo: "",
};

export default function GradeBandsPage(props: PageProps<"/academics/grade-systems/[id]/configure">) {
  const { id } = use(props.params);
  const gradeSystemId = Number(id);

  const gradeSystems = useListStore(gradeSystemStore);
  const bands = useListStore(gradeBandStore).filter((b) => b.gradeSystemId === gradeSystemId);
  const gradeSystem = gradeSystems.find((g) => g.id === gradeSystemId);
  const { toast } = useToast();

  const [modal, setModal] = useState<GradeSystemConfiguration | "new" | null>(null);
  const [form, setForm] = useState(emptyBand);
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setForm(emptyBand);
    setError(null);
    setModal("new");
  }
  function openEdit(b: GradeSystemConfiguration) {
    setForm({
      gradeName: b.gradeName,
      gradePoint: String(b.gradePoint),
      lowerLimit: String(b.lowerLimit),
      upperLimit: String(b.upperLimit),
      rank: b.rank != null ? String(b.rank) : "",
      subjectStatus: b.subjectStatus,
      classObtained: b.classObtained ?? "",
      description: b.description ?? "",
      gradeUniqueNo: b.gradeUniqueNo ?? "",
    });
    setError(null);
    setModal(b);
  }

  function handleSubmit() {
    const lower = Number(form.lowerLimit);
    const upper = Number(form.upperLimit);
    if (!form.gradeName.trim() || form.gradePoint === "" || form.lowerLimit === "" || form.upperLimit === "") {
      setError("Grade Name, Grade Point, Lower Limit and Upper Limit are required.");
      return;
    }
    if (upper < lower) {
      setError("Upper Limit must be greater than or equal to Lower Limit.");
      return;
    }
    setError(null);
    const payload = {
      gradeSystemId,
      gradeName: form.gradeName,
      gradePoint: Number(form.gradePoint),
      lowerLimit: lower,
      upperLimit: upper,
      rank: form.rank ? Number(form.rank) : undefined,
      subjectStatus: form.subjectStatus,
      classObtained: form.classObtained || undefined,
      description: form.description || undefined,
      gradeUniqueNo: form.gradeUniqueNo || undefined,
    };
    if (modal && modal !== "new") {
      gradeBandStore.update(modal.id, payload);
      toast("Grade band updated.", "success");
    } else {
      gradeBandStore.add({ id: nextId(), ...payload });
      toast("Grade band added.", "success");
    }
    setModal(null);
  }

  return (
    <AcademicListPage
      title={`Grade Bands — ${gradeSystem?.name ?? ""}`}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Grade Systems", href: "/academics/grade-systems" },
        { label: "Configure" },
      ]}
    >
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title">Pass/Fail Condition</div>
        <div className="flex gap-16">
          {(["Marks", "Grade"] as const).map((opt) => (
            <label key={opt} className="checkbox-row">
              <input
                type="radio"
                name="passFail"
                checked={gradeSystem?.passFailCondition === opt}
                onChange={() => gradeSystemStore.update(gradeSystemId, { passFailCondition: opt })}
              />
              {opt}
            </label>
          ))}
        </div>
        <p className="disabled-note mt-8">Client wiring for this control was unconfirmed in the legacy source — verify against a running instance.</p>
      </div>

      <DataTable
        rowKey={(b) => b.id}
        rows={bands}
        headerActions={
          <Button variant="primary" onClick={openAdd}>
            Add
          </Button>
        }
        emptyMessage="No grade bands configured yet."
        columns={[
          { key: "gradeName", header: "Grade Name", sortable: true },
          { key: "gradePoint", header: "Grade Point", sortable: true },
          { key: "lowerLimit", header: "Lower Limit", sortable: true },
          { key: "upperLimit", header: "Upper Limit", sortable: true },
          { key: "rank", header: "Rank", sortable: true, render: (b) => b.rank ?? "—" },
          { key: "classObtained", header: "Class Obtained", render: (b) => b.classObtained ?? "—" },
          {
            key: "subjectStatus",
            header: "Status",
            sortable: true,
            render: (b) => <span className={`badge ${b.subjectStatus === "Pass" ? "badge-success" : "badge-danger"}`}>{b.subjectStatus}</span>,
          },
          { key: "description", header: "Description" },
        ]}
        renderActions={(b) => (
          <>
            <EditIconButton onClick={() => openEdit(b)} />
            <DeleteConfirmButton
              iconOnly
              itemLabel={b.gradeName}
              onConfirm={() => {
                gradeBandStore.remove(b.id);
                toast("Grade band deleted.", "success");
              }}
            />
          </>
        )}
      />

      <Modal open={!!modal} title={modal && modal !== "new" ? "Edit Grade Band" : "Add Grade Band"} onClose={() => setModal(null)}>
        <div className="field-row">
          <div className="field">
            <label>
              Grade Name<span className="req">*</span>
            </label>
            <input className="input" value={form.gradeName} onChange={(e) => setForm({ ...form, gradeName: e.target.value })} />
          </div>
          <div className="field">
            <label>
              Grade Point<span className="req">*</span>
            </label>
            <input className="input" type="number" value={form.gradePoint} onChange={(e) => setForm({ ...form, gradePoint: e.target.value })} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>
              Lower Limit<span className="req">*</span>
            </label>
            <input className="input" type="number" value={form.lowerLimit} onChange={(e) => setForm({ ...form, lowerLimit: e.target.value })} />
          </div>
          <div className="field">
            <label>
              Upper Limit<span className="req">*</span>
            </label>
            <input className="input" type="number" value={form.upperLimit} onChange={(e) => setForm({ ...form, upperLimit: e.target.value })} />
          </div>
        </div>
        {error && <p className="error mt-8">{error}</p>}
        <div className="field-row">
          <div className="field">
            <label>Rank</label>
            <input className="input" type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} />
          </div>
          <div className="field">
            <label>Subject Status</label>
            <div className="flex gap-16 mt-8">
              {(["Pass", "Fail"] as const).map((s) => (
                <label key={s} className="checkbox-row">
                  <input type="radio" name="subjectStatus" checked={form.subjectStatus === s} onChange={() => setForm({ ...form, subjectStatus: s })} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Class Obtained</label>
            <select
              className="select"
              value={form.classObtained}
              onChange={(e) => setForm({ ...form, classObtained: e.target.value as GradeSystemConfiguration["classObtained"] })}
            >
              <option value="">None</option>
              <option value="Distinction">Distinction</option>
              <option value="First Class">First Class</option>
              <option value="Second Class">Second Class</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="field">
            <label>Grade Unique No</label>
            <input className="input" value={form.gradeUniqueNo} onChange={(e) => setForm({ ...form, gradeUniqueNo: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="field">
          <label>Image (.jpg, .jpeg, .gif, .png)</label>
          <input className="input" type="file" accept=".jpg,.jpeg,.gif,.png" />
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
