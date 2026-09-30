"use client";

import { ReactNode } from "react";

import styles from "./LayoutContainer.module.css";

interface LayoutContainerProps {
  id: string;

  title: string;

  selected?: boolean;

  children?: ReactNode;

  onClick?: () => void;

  onDrop?: (
    event: React.DragEvent<HTMLDivElement>
  ) => void;

  onDragOver?: (
    event: React.DragEvent<HTMLDivElement>
  ) => void;
}

export default function LayoutContainer({
  title,
  selected = false,
  children,
  onClick,
  onDrop,
  onDragOver,
}: LayoutContainerProps) {
  return (
    <div
      className={`${styles.container} ${
        selected ? styles.selected : ""
      }`}
      onClick={onClick}
    >
      {/* Header */}

      <div className={styles.header}>
        <span className={styles.title}>
          {title}
        </span>
      </div>

      {/* Body */}

      {/* <div
        className={styles.body}
        onDrop={onDrop}
        onDragOver={onDragOver}
      > */}
      <div
  className={styles.body}
  onDrop={(event) => {
    event.stopPropagation();
    onDrop?.(event);
  }}
  onDragOver={(event) => {
    event.preventDefault();
    event.stopPropagation();
    onDragOver?.(event);
  }}
>
        {children ? (
          children
        ) : (
          <div className={styles.empty}>
            Drop fields here
          </div>
        )}
      </div>
    </div>
  );
}