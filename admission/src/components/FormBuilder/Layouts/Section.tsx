
// "use client";

// import { ReactNode } from "react";

// import styles from "./Layout.module.css";

// interface SectionProps {
//   title?: string;

//   children?: ReactNode;

//   // onDrop?: (
//   //   event: React.DragEvent<HTMLElement>
//   // ) => void;

//   // onDragOver?: (
//   //   event: React.DragEvent<HTMLElement>
//   // ) => void;
//   onDrop?: (
//   event: React.DragEvent<HTMLElement>
// ) => void;

// onDragOver?: (
//   event: React.DragEvent<HTMLElement>
// ) => void;
// }

// export default function Section({
//   title = "Section",
//   children,
//   onDrop,
//   onDragOver,
// }: SectionProps) {
//   return (
//     <section
//       className={`${styles.layout} ${styles.section}`}
//       onDrop={onDrop}
//       onDragOver={onDragOver}
//       style={{
//         minHeight: 150,
//       }}
//     >
//       <h2 className={styles.sectionTitle}>
//         {title}
//       </h2>

//       <div
//         className={styles.sectionContent}
//         style={{
//           minHeight: 100,
//         }}
//       >
//         {children ? (
//           children
//         ) : (
//           <div className={styles.dropZone}>
//             Drop fields here
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
"use client";

import { ReactNode } from "react";

import styles from "./Layout.module.css";

interface SectionProps {
  title?: string;

  children?: ReactNode;

  selected?: boolean;

  onClick?: () => void;

  onDrop?: (
    event: React.DragEvent<HTMLElement>
  ) => void;

  onDragOver?: (
    event: React.DragEvent<HTMLElement>
  ) => void;
}

export default function Section({
  title = "Section",
  children,
  selected = false,
  onClick,
  onDrop,
  onDragOver,
}: SectionProps) {
  return (
    <section
      className={`${styles.layout} ${styles.section}`}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        minHeight: 150,
        border: selected
          ? "2px solid #2563eb"
          : "2px dashed #d1d5db",
      }}
    >
      <h2 className={styles.sectionTitle}>
        {title}
      </h2>

      <div
        className={styles.sectionContent}
        style={{
          minHeight: 100,
        }}
      >
        {children ? (
          children
        ) : (
          <div className={styles.dropZone}>
            Drop fields here
          </div>
        )}
      </div>
    </section>
  );
}