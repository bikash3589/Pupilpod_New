"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import {
  PencilIcon,
  TrashIcon,
  GearIcon,
  CloudUploadIcon,
  BriefcasePlusIcon,
  DocumentListIcon,
} from "@/components/ui/icons";
import CopyToDestinationModal from "@/components/academics/buttons/CopyToDestinationModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchStore } from "@/lib/mock/academics/stores";
import { academicYears, nextId, programs, yearGroups } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";
import { Sketch } from "@/types/academics";

const emptyForm = {
  sketchName: "",
  sketchCode: "",
  schoolYearId: 1,
  programId: 1,
  selectedYearGroupIds: [1, 2, 3] as number[],
};

export default function SketchesPage() {
  const sketches = useListStore(sketchStore);
  const { toast } = useToast();
  const [addModal, setAddModal] = useState(false);
  const [editSketch, setEditSketch] = useState<Sketch | null>(null);
  const [deleteSketch, setDeleteSketch] = useState<Sketch | null>(null);
  const [configureSketch, setConfigureSketch] = useState<Sketch | null>(null);
  const [reportConfigSketch, setReportConfigSketch] = useState<Sketch | null>(null);
  const [form, setForm] = useState(emptyForm);

  function handleCreate() {
    if (!form.sketchName.trim() || !form.sketchCode.trim()) {
      toast("Sketch Name and Code are required.", "error");
      return;
    }
    sketchStore.add({
      id: nextId(),
      sketchName: form.sketchName,
      sketchCode: form.sketchCode,
      schoolYearId: form.schoolYearId,
      programIds: [form.programId],
      yearGroupIds: form.selectedYearGroupIds,
    });
    toast("Sketch created successfully.", "success");
    setAddModal(false);
    setForm(emptyForm);
  }

  function handleUpdate() {
    if (!editSketch) return;
    if (!editSketch.sketchName.trim() || !editSketch.sketchCode.trim()) {
      toast("Sketch Name and Code are required.", "error");
      return;
    }
    sketchStore.update(editSketch.id, {
      sketchName: editSketch.sketchName,
      sketchCode: editSketch.sketchCode,
      schoolYearId: editSketch.schoolYearId,
      programIds: editSketch.programIds,
      yearGroupIds: editSketch.yearGroupIds,
    });
    toast("Sketch updated successfully.", "success");
    setEditSketch(null);
  }

  function handleDelete() {
    if (!deleteSketch) return;
    sketchStore.remove(deleteSketch.id);
    toast("Sketch deleted successfully.", "success");
    setDeleteSketch(null);
  }

  function toggleYearGroupSelection(ygId: number, currentList: number[]) {
    if (currentList.includes(ygId)) {
      return currentList.filter((id) => id !== ygId);
    } else {
      return [...currentList, ygId];
    }
  }

  return (
    <AcademicListPage
      title="Manage Sketch"
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Manage Sketch" }]}
    >
      <DataTable
        rowKey={(s) => s.id}
        rows={sketches}
        showSerial={true}
        serialHeader="SI NO"
        duplicateControls={true}
        headerActions={
          <Button variant="primary" onClick={() => setAddModal(true)}>
            Add
          </Button>
        }
        columns={[
          {
            key: "sketchName",
            header: "NAME",
            sortable: true,
            render: (s) => s.sketchName,
          },
          {
            key: "sketchCode",
            header: "CODE",
            sortable: true,
            render: (s) => s.sketchCode,
          },
          {
            key: "schoolYearId",
            header: "ACADEMIC YEAR",
            sortable: true,
            accessor: (s) => academicYears.find((y) => y.id === s.schoolYearId)?.name ?? "2026-2027",
            render: (s) => academicYears.find((y) => y.id === s.schoolYearId)?.name ?? "2026-2027",
          },
          {
            key: "programIds",
            header: "PROGRAM",
            sortable: true,
            accessor: (s) =>
              s.programIds.map((pid) => programs.find((p) => p.id === pid)?.name).filter(Boolean).join(",") || "CBSE",
            render: (s) =>
              s.programIds.map((pid) => programs.find((p) => p.id === pid)?.name).filter(Boolean).join(",") || "CBSE",
          },
          {
            key: "yearGroupIds",
            header: "CLASS",
            sortable: true,
            accessor: (s) =>
              s.yearGroupIds.map((yid) => yearGroups.find((y) => y.id === yid)?.name).filter(Boolean).join(",") ||
              "Class 1,Class 2,Class 3",
            render: (s) =>
              s.yearGroupIds.map((yid) => yearGroups.find((y) => y.id === yid)?.name).filter(Boolean).join(",") ||
              "Class 1,Class 2,Class 3",
          },
          {
            key: "file",
            header: "FILE",
            sortable: true,
            render: () => "",
          },
        ]}
        renderActions={(s) => (
          <div className="flex items-center gap-6">
            {/* 1. Edit Action Icon */}
            <button
              type="button"
              className="action-icon-btn"
              title="Edit Sketch"
              aria-label="Edit Sketch"
              onClick={() => setEditSketch({ ...s })}
            >
              <PencilIcon />
            </button>

            {/* 2. Delete Action Icon */}
            <button
              type="button"
              className="action-icon-btn"
              title="Delete Sketch"
              aria-label="Delete Sketch"
              onClick={() => setDeleteSketch(s)}
            >
              <TrashIcon />
            </button>

            {/* 3. Configure Gear Action Icon */}
            <button
              type="button"
              className="action-icon-btn"
              title="Configure Sketch"
              aria-label="Configure Sketch"
              onClick={() => setConfigureSketch(s)}
            >
              <GearIcon />
            </button>

            {/* 4. Cloud Upload / Templates Icon */}
            <Link
              href={`/academics/sketches/${s.id}/templates`}
              className="action-icon-btn"
              title="Upload Template / Sketch Templates"
              aria-label="Upload Template / Sketch Templates"
            >
              <CloudUploadIcon />
            </Link>

            {/* 5. Briefcase / Generate Sketch Result Icon */}
            <Link
              href={`/academics/sketches/${s.id}/generate`}
              className="action-icon-btn"
              title="Generate Sketch Result"
              aria-label="Generate Sketch Result"
            >
              <BriefcasePlusIcon />
            </Link>

            {/* 6. Document / Report Configs Action Icon */}
            <button
              type="button"
              className="action-icon-btn"
              title="Report Configurations"
              aria-label="Report Configurations"
              onClick={() => setReportConfigSketch(s)}
            >
              <DocumentListIcon />
            </button>
          </div>
        )}
      />

      {/* Add Sketch Modal */}
      <Modal open={addModal} title="Add Sketch" onClose={() => setAddModal(false)}>
        <div className="field">
          <label>
            Sketch Name<span className="req">*</span>
          </label>
          <input
            className="input"
            value={form.sketchName}
            onChange={(e) => setForm({ ...form, sketchName: e.target.value })}
            placeholder="e.g. Half_Yearly_1_5"
          />
        </div>
        <div className="field">
          <label>
            Sketch Code<span className="req">*</span>
          </label>
          <input
            className="input"
            value={form.sketchCode}
            onChange={(e) => setForm({ ...form, sketchCode: e.target.value })}
            placeholder="e.g. Half_Yearly_1_5"
          />
        </div>
        <div className="field">
          <label>Academic Year</label>
          <select
            className="select"
            value={form.schoolYearId}
            onChange={(e) => setForm({ ...form, schoolYearId: Number(e.target.value) })}
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Program</label>
          <select
            className="select"
            value={form.programId}
            onChange={(e) => setForm({ ...form, programId: Number(e.target.value) })}
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Classes</label>
          <div className="multiselect">
            {yearGroups
              .filter((yg) => yg.programId === form.programId)
              .map((yg) => (
                <label key={yg.id}>
                  <input
                    type="checkbox"
                    checked={form.selectedYearGroupIds.includes(yg.id)}
                    onChange={() =>
                      setForm({
                        ...form,
                        selectedYearGroupIds: toggleYearGroupSelection(yg.id, form.selectedYearGroupIds),
                      })
                    }
                  />
                  {yg.name}
                </label>
              ))}
          </div>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create
          </Button>
        </div>
      </Modal>

      {/* Edit Sketch Modal */}
      {editSketch && (
        <Modal open={!!editSketch} title={`Edit Sketch — ${editSketch.sketchName}`} onClose={() => setEditSketch(null)}>
          <div className="field">
            <label>
              Sketch Name<span className="req">*</span>
            </label>
            <input
              className="input"
              value={editSketch.sketchName}
              onChange={(e) => setEditSketch({ ...editSketch, sketchName: e.target.value })}
            />
          </div>
          <div className="field">
            <label>
              Sketch Code<span className="req">*</span>
            </label>
            <input
              className="input"
              value={editSketch.sketchCode}
              onChange={(e) => setEditSketch({ ...editSketch, sketchCode: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Academic Year</label>
            <select
              className="select"
              value={editSketch.schoolYearId}
              onChange={(e) => setEditSketch({ ...editSketch, schoolYearId: Number(e.target.value) })}
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setEditSketch(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteSketch && (
        <ConfirmDialog
          open={!!deleteSketch}
          title="Delete Sketch"
          message={`Are you sure you want to delete "${deleteSketch.sketchName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteSketch(null)}
        />
      )}

      {/* Configure Sketch Modal */}
      {configureSketch && (
        <Modal
          open={!!configureSketch}
          title={`Configure — ${configureSketch.sketchName}`}
          onClose={() => setConfigureSketch(null)}
        >
          <div className="flex flex-col gap-12">
            <p className="text-sm text-muted">Select an option below to configure report attributes, template files, or card settings:</p>
            <div className="grid-3">
              <Link
                href={`/academics/sketches/${configureSketch.id}/attributes`}
                className="btn btn-secondary"
                onClick={() => setConfigureSketch(null)}
              >
                Attributes
              </Link>
              <Link
                href={`/academics/sketches/${configureSketch.id}/templates`}
                className="btn btn-secondary"
                onClick={() => setConfigureSketch(null)}
              >
                Templates
              </Link>
              <Link
                href={`/academics/sketches/${configureSketch.id}/report-configs`}
                className="btn btn-secondary"
                onClick={() => setConfigureSketch(null)}
              >
                Report Configurations
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Configurations Preview Modal */}
      {reportConfigSketch && (
        <Modal
          open={!!reportConfigSketch}
          title={`Report Configurations — ${reportConfigSketch.sketchName}`}
          onClose={() => setReportConfigSketch(null)}
        >
          <div className="flex flex-col gap-12">
            <p className="text-sm text-muted">
              Manage and assign template report cards for <strong>{reportConfigSketch.sketchName}</strong> ({reportConfigSketch.sketchCode}).
            </p>
            <div className="form-actions">
              <Link
                href={`/academics/sketches/${reportConfigSketch.id}/report-configs`}
                className="btn btn-primary"
                onClick={() => setReportConfigSketch(null)}
              >
                Go to Report Configurations
              </Link>
              <Button variant="secondary" onClick={() => setReportConfigSketch(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AcademicListPage>
  );
}
