"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkExport?: () => void;
  requireSelectionMessage?: string;
}

export default function BulkActionsBar({
  selectedCount,
  onBulkDelete,
  onBulkExport,
  requireSelectionMessage = "Please select at least one row.",
}: BulkActionsBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  return (
    <>
      {selectedCount > 0 && <span className="badge badge-primary">{selectedCount} selected</span>}
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          if (selectedCount === 0) {
            toast(requireSelectionMessage, "error");
            return;
          }
          setConfirmOpen(true);
        }}
      >
        Bulk Delete
      </Button>
      {onBulkExport && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (selectedCount === 0) {
              toast(requireSelectionMessage, "error");
              return;
            }
            onBulkExport();
          }}
        >
          Bulk Export
        </Button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Bulk delete"
        message={`Delete ${selectedCount} selected row(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onBulkDelete();
        }}
      />
    </>
  );
}
