"use client";

import styles from "./Tile.module.css";

interface TileProps {
  title: string;
  icon: React.ReactNode;
  dragData: string;
}

export default function Tile({
  title,
  icon,
  dragData,
}: TileProps) {
  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>
  ) {
    // event.dataTransfer.setData(
    //   "drag-item",
    //   dragData
    // );
    event.dataTransfer.setData(
  "templateId",
  dragData
);
    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div
      className={styles.tile}
      draggable
      onDragStart={handleDragStart}
    >
      <div className={styles.icon}>
        {icon}
      </div>

      <span className={styles.title}>
        {title}
      </span>
    </div>
  );
}