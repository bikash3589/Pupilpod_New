"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import { academicYears } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface CopyToDestinationModalProps {
  sourceLabel: string;
  triggerLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
  onCopy: (destination: { academicYearId: number; programId: number; yearGroupId: number }) => void;
}

export default function CopyToDestinationModal({
  sourceLabel,
  triggerLabel = "Copy",
  disabled,
  disabledReason,
  onCopy,
}: CopyToDestinationModalProps) {
  const [open, setOpen] = useState(false);
  const [academicYearId, setAcademicYearId] = useState<number | null>(academicYears[0]?.id ?? null);
  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);
  const { toast } = useToast();

  function handleSubmit() {
    if (!academicYearId || !programId || !yearGroupId) {
      toast("Select the destination academic year, program and class.", "error");
      return;
    }
    onCopy({ academicYearId, programId, yearGroupId });
    toast("Copied successfully.", "success");
    setOpen(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" disabled={disabled} disabledReason={disabledReason} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Modal open={open} title="Copy to destination" onClose={() => setOpen(false)}>
        <div className="field">
          <label>Source</label>
          <input className="input" value={sourceLabel} disabled readOnly />
        </div>
        <div className="section-title">Destination</div>
        <div className="field-row">
          <div className="field">
            <label>Academic Year</label>
            <select
              className="select"
              value={academicYearId ?? ""}
              onChange={(e) => setAcademicYearId(e.target.value ? Number(e.target.value) : null)}
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          <CascadingClassPicker
            programId={programId}
            yearGroupId={yearGroupId}
            onChange={(next) => {
              setProgramId(next.programId);
              setYearGroupId(next.yearGroupId);
            }}
            showSection={false}
          />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Copy
          </Button>
        </div>
      </Modal>
    </>
  );
}
