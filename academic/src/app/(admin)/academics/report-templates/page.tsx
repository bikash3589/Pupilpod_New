"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { globalTemplateStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function GlobalReportTemplatesPage() {
  const templates = useListStore(globalTemplateStore);
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");

  function downloadTemplate() {
    const csv = "Name,File\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-templates-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <AcademicListPage title="Report Templates" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Report Templates" }]}>
      <DataTable
        rowKey={(t) => t.id}
        rows={templates}
        showSerial
        headerActions={
          <>
            <Button variant="primary" size="sm" onClick={() => setModal(true)}>
              Add
            </Button>
            <Button variant="primary" size="sm" onClick={downloadTemplate}>
              Deafult Template
            </Button>
          </>
        }
        columns={[
          { key: "name", header: "Template Name", sortable: true },
          { key: "filename", header: "Template File", sortable: true },
        ]}
        renderActions={(t) => (
          <DeleteConfirmButton
            iconOnly
            itemLabel={t.name}
            onConfirm={() => {
              globalTemplateStore.remove(t.id);
              toast("Template deleted.", "success");
            }}
          />
        )}
      />

      <Modal open={modal} title="Add Global Template" onClose={() => setModal(false)}>
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Upload File (PDF)</label>
          <input className="input" type="file" accept=".pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!name.trim()) return;
              globalTemplateStore.add({ id: nextId(), name, filename: fileName || "template.pdf" });
              setModal(false);
              setName("");
              setFileName("");
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </AcademicListPage>
  );
}
