"use client";

import { ReactNode } from "react";

import styles from "./Layout.module.css";

interface ContainerProps {
  id?: string;

  title?: string;

  description?: string;

  className?: string;

  children?: ReactNode;

  selected?: boolean;

  onClick?: () => void;

  onDrop?: (
    event: React.DragEvent<HTMLDivElement>
  ) => void;

  onDragOver?: (
    event: React.DragEvent<HTMLDivElement>
  ) => void;
}

export default function Container({
  id,
  title = "Container",
  description,
  className = "",
  children,
  selected = false,
  onClick,
  onDrop,
  onDragOver,
}: ContainerProps) {
  return (
    <section
      id={id}
      className={`${styles.layout} ${styles.container} ${className}`}
      onClick={onClick}
      style={{
        border: selected
          ? "2px solid #2563eb"
          : "2px dashed #cbd5e1",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        background: "#ffffff",
      }}
    >
      <div
        style={{
          marginBottom: 12,
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            marginBottom: 12,
            color: "#6b7280",
          }}
        >
          {description}
        </div>
      )}

      <div
        className={styles.containerBody}
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          minHeight: 120,
          border: "2px dashed #d1d5db",
          borderRadius: 6,
          padding: 12,
          background: "#fafafa",
        }}
      >
        {children ?? (
          <div
            style={{
              color: "#9ca3af",
              textAlign: "center",
              paddingTop: 35,
            }}
          >
            THIS IS CONTAINER COMPONENT
          </div>
        )}
      </div>
    </section>
  );
}
