"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { TrashIcon } from "@/components/ui/icons";

interface DeleteConfirmButtonProps {
  onConfirm: () => void;
  itemLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
  size?: "sm" | "md";
  /** Render as a square icon button (matches the app's list-page action-column style) instead of a labeled button. */
  iconOnly?: boolean;
}

export default function DeleteConfirmButton({
  onConfirm,
  itemLabel = "this item",
  disabled,
  disabledReason,
  size = "sm",
  iconOnly = false,
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          className="icon-btn"
          title={disabled ? disabledReason : "Delete"}
          aria-label="Delete"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <TrashIcon />
        </button>
      ) : (
        <Button variant="danger" size={size} disabled={disabled} disabledReason={disabledReason} onClick={() => setOpen(true)}>
          Delete
        </Button>
      )}
      <ConfirmDialog
        open={open}
        title="Confirm delete"
        message={`Are you sure you want to delete ${itemLabel}? This action cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          onConfirm();
        }}
      />
    </>
  );
}
