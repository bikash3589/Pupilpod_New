// "use client";

// import { ReactNode } from "react";

// import styles from "./Layout.module.css";

// interface ColumnProps {
//   id?: string;

//   span?: 2 | 3 | 4 | 6 | 12;

//   className?: string;

//   children?: ReactNode;

//   selected?: boolean;

//   onClick?: () => void;
// }

// export default function Column({
//   id,
//   span = 12,
//   className = "",
//   children,
//   selected = false,
//   onClick,
// }: ColumnProps) {
//   return (
//     <div
//       id={id}
//       className={`${styles.column} ${styles[`span${span}`]} ${className}`}
//       onClick={onClick}
//       style={{
//         border: selected
//           ? "2px solid #2563eb"
//           : undefined,
//       }}
//     >
//       {children ? (
//         children
//       ) : (
//         <div className={styles.dropZone}>
//           Drop fields here
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { ReactNode } from "react";

import styles from "./Layout.module.css";

interface ColumnProps {
  id?: string;

  span?: number;

  height?: number;

  gridColumn?: string;

  className?: string;

  children?: ReactNode;

  selected?: boolean;

  onClick?: () => void;

  onDrop?: (
    event: React.DragEvent<HTMLElement>
  ) => void;

  onDragOver?: (
    event: React.DragEvent<HTMLElement>
  ) => void;

  onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

export default function Column({
  id,
  span = 12,
  height,
  gridColumn,
  className = "",
  children,
  selected = false,
  onClick,
  onDrop,
  onDragOver,
  onResizeStart,
}: ColumnProps) {
  return (
    <div
      id={id}
      className={`${styles.column} ${styles[`span${span}`]} ${className}`}
      data-grid-cell
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        border: selected
          ? "2px solid #2563eb"
          : undefined,
        minHeight: height,
        height,
        gridColumn: gridColumn ?? `span ${span}`,
      }}
    >
      {children ? (
        children
      ) : (
        <div className={styles.dropZone}>
          Drop fields here
        </div>
      )}
      {onResizeStart && (
        <button
          type="button"
          className={styles.resizeHandle}
          aria-label="Resize column"
          onPointerDown={onResizeStart}
        />
      )}
    </div>
  );
}
