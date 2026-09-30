"use client";

import styles from "./PaletteItem.module.css";

interface PaletteItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  badge?: string;
  dragData: string;
}

export default function PaletteItem({
  title,
  subtitle,
  icon,
  badge,
  dragData,
}: PaletteItemProps) {
  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.dataTransfer.setData(
      "drag-item",
      dragData
    );

    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div
      className={styles.item}
      draggable
      onDragStart={handleDragStart}
    >
      <div className={styles.icon}>
        {icon}
      </div>

      <div className={styles.content}>
        <h4>{title}</h4>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      {badge && (
        <span className={styles.badge}>
          {badge}
        </span>
      )}
    </div>
  );
}