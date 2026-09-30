"use client";

import { ReactNode } from "react";

import styles from "./Layout.module.css";

interface RowProps {
  id?: string;

  children?: ReactNode;

  className?: string;

  selected?: boolean;

  onClick?: () => void;

  gridTemplateColumns?: string;
}

export default function Row({
  id,
  children,
  className = "",
  selected = false,
  onClick,
  gridTemplateColumns,
}: RowProps) {
  return (
    <div
      id={id}
      className={`${styles.row} ${styles.worksheetRow} ${className}`}
      data-grid-row
      role="grid"
      onClick={onClick}
      style={{
        border: selected
          ? "2px solid #2563eb"
          : undefined,
        padding: 0,
        borderRadius: 0,
        gridTemplateColumns,
      }}
    >
      {children}
    </div>
  );
}
