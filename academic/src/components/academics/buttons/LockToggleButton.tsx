"use client";

interface LockToggleButtonProps {
  label: string;
  activeLabel: string;
  inactiveLabel: string;
  value: boolean;
  onToggle: (next: boolean) => void;
  icon?: { on: string; off: string };
}

export default function LockToggleButton({
  label,
  activeLabel,
  inactiveLabel,
  value,
  onToggle,
  icon = { on: "●", off: "○" },
}: LockToggleButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-sm ${value ? "btn-primary" : "btn-secondary"}`}
      title={`${label}: ${value ? activeLabel : inactiveLabel} (click to toggle)`}
      onClick={() => onToggle(!value)}
    >
      <span aria-hidden>{value ? icon.on : icon.off}</span>
      {value ? activeLabel : inactiveLabel}
    </button>
  );
}
