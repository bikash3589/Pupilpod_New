"use client";

import Button from "@/components/ui/Button";

interface SaveMarksButtonProps {
  onSave: () => void;
  disabledReason?: string | null;
  saving?: boolean;
}

export default function SaveMarksButton({ onSave, disabledReason, saving }: SaveMarksButtonProps) {
  const disabled = Boolean(disabledReason) || saving;
  return (
    <Button
      variant="primary"
      disabled={disabled}
      disabledReason={disabledReason ?? undefined}
      onClick={onSave}
    >
      {saving ? "Saving…" : "Save"}
    </Button>
  );
}
