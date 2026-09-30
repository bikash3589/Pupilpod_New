"use client";

import Link from "next/link";
import { PencilIcon } from "@/components/ui/icons";

interface EditIconButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export default function EditIconButton({ href, onClick, label = "Edit" }: EditIconButtonProps) {
  if (href) {
    return (
      <Link href={href} className="icon-btn" title={label} aria-label={label}>
        <PencilIcon />
      </Link>
    );
  }
  return (
    <button type="button" className="icon-btn" title={label} aria-label={label} onClick={onClick}>
      <PencilIcon />
    </button>
  );
}
