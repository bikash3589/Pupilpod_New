// "use client";

// import { ReactNode } from "react";

// interface SidebarSectionProps {
//   title: string;

//   children: ReactNode;
// }

// export default function SidebarSection({
//   title,
//   children,
// }: SidebarSectionProps) {
//   return (
//     <div
//       style={{
//         marginBottom: 35,
//       }}
//     >
//       <h2
//         style={{
//           marginBottom: 15,
//           fontSize: 18,
//           fontWeight: 600,
//         }}
//       >
//         {title}
//       </h2>

//       {children}
//     </div>
//   );
// }

"use client";
import { ReactNode, useState } from "react";

import styles from "./SidebarSection.module.css";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: SidebarSectionProps) {
  const [open, setOpen] =useState(defaultOpen);

  return (
    <section className={styles.section}>
      <button
        className={styles.header}
        onClick={() =>
          setOpen((previous) => !previous)
        }
      >
        <span className={styles.title}>
          {title}
        </span>

        <span className={styles.arrow}>
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <div className={styles.body}>
          {children}
        </div>
      )}
    </section>
  );
}