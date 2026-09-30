"use client";

import styles from "./Layout.module.css";

interface DividerProps {
  margin?: number;
}

export default function Divider({
  margin = 24,
}: DividerProps) {
  return (
    <div
      className={styles.divider}
      style={{
        margin: `${margin}px 0`,
      }}
    />
  );
}