import { ReactNode } from "react";

import styles from "./TileGrid.module.css";

interface TileGridProps {
  children: ReactNode;
}

export default function TileGrid({
  children,
}: TileGridProps) {
  return (
    <div className={styles.grid}>
      {children}
    </div>
  );
}