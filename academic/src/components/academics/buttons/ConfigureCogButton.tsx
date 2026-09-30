"use client";

import { ReactNode, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface ConfigureCogButtonProps {
  title: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  size?: "md" | "lg";
  label?: string;
}

export default function ConfigureCogButton({ title, children, size = "md", label }: ConfigureCogButtonProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="ghost" size={label ? "sm" : "icon"} title="Configure" onClick={() => setOpen(true)}>
        ⚙{label ? ` ${label}` : ""}
      </Button>
      <Modal open={open} title={title} onClose={close} size={size}>
        {typeof children === "function" ? children(close) : children}
      </Modal>
    </>
  );
}
