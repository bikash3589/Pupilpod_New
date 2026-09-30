"use client";

import { use, useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchStore, sketchTemplateStore } from "@/lib/mock/academics/stores";
import { nextId, programs, yearGroups } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface SketchTemplatesPageProps {
  params: Promise<{ id: string }>;
}

export default function SketchTemplatesPage({ params }: SketchTemplatesPageProps) {
  const { id } = use(params);
  const sketchId = Number(id);
  const sketches = useListStore(sketchStore);
  const templates = useListStore(sketchTemplateStore).filter((t) => t.sketchId === sketchId);
  const sketch = sketches.find((s) => s.id === sketchId);
  const { toast } = useToast();

  const [addModal, setAddModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("CBSE");
  const [selectedClass, setSelectedClass] = useState("Class 1,Class 2,Class 3");
  const [fileName, setFileName] = useState("");

  function handleAddTemplate() {
    if (!templateName.trim()) {
      toast("Template Name is required.", "error");
      return;
    }
    sketchTemplateStore.add({
      id: nextId(),
      sketchId,
      name: templateName,
      programName: selectedProgram,
      className: selectedClass,
      filename: fileName || "sketch_template.pdf",
    });
    toast("Sketch template added.", "success");
    setAddModal(false);
    setTemplateName("");
    setFileName("");
  }

  function handleAddDefaultTemplate() {
    sketchTemplateStore.add({
      id: nextId(),
      sketchId,
      name: `${sketch?.sketchName ?? "Sketch"} - Standard Template`,
      programName: "CBSE",
      className: "Class 1,Class 2,Class 3",
      filename: "Default_Sketch_Template.pdf",
    });
    toast("Default template added successfully.", "success");
  }

  return (
    <AcademicListPage
      title="Sketch Templates"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Manage Sketch", href: "/academics/sketches" },
        { label: "Sketch Templates" },
      ]}
    >
      <DataTable
        rowKey={(t) => t.id}
        rows={templates}
        showSerial={true}
        serialHeader="SI NO"
        duplicateControls={true}
        emptyMessage="No data available in table"
        headerActions={
          <div className="flex items-center gap-8">
            <Button variant="primary" onClick={() => setAddModal(true)}>
              Add
            </Button>
            <Button variant="primary" onClick={handleAddDefaultTemplate}>
              Deafult Template
            </Button>
          </div>
        }
        columns={[
          {
            key: "name",
            header: "TEMPLATE NAME",
            sortable: true,
            render: (t) => t.name,
          },
          {
            key: "programName",
            header: "PROGRAM",
            sortable: true,
            render: (t) => t.programName || "CBSE",
          },
          {
            key: "className",
            header: "CLASS",
            sortable: true,
            render: (t) => t.className || "Class 1,Class 2,Class 3",
          },
          {
            key: "filename",
            header: "TEMPLATE FILE",
            sortable: true,
            render: (t) => t.filename,
          },
        ]}
        renderActions={(t) => (
          <div className="flex items-center gap-6">
            <Link
              href={`/academics/sketches/${sketchId}/templates/${t.id}/configure-image`}
              className="btn btn-secondary btn-sm"
            >
              Configure Image
            </Link>
            <DeleteConfirmButton
              iconOnly
              itemLabel={t.name}
              onConfirm={() => {
                sketchTemplateStore.remove(t.id);
                toast("Template deleted.", "success");
              }}
            />
          </div>
        )}
      />

      <Modal open={addModal} title="Add Sketch Template" onClose={() => setAddModal(false)}>
        <div className="field">
          <label>
            Template Name<span className="req">*</span>
          </label>
          <input
            className="input"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. Standard Progress Card Layout"
          />
        </div>

        <div className="field">
          <label>Program</label>
          <select
            className="select"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            {programs.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Class</label>
          <input
            className="input"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            placeholder="e.g. Class 1,Class 2,Class 3"
          />
        </div>

        <div className="field">
          <label>Upload Template File (PDF)</label>
          <input
            className="input"
            type="file"
            accept=".pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={() => setAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddTemplate}>
            Save
          </Button>
        </div>
      </Modal>
    </AcademicListPage>
  );
}
