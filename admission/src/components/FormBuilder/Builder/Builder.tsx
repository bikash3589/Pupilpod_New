"use client";

import "../variable.css";
import "../reset.css";
import styles from "./Builder.module.css";

import Toolbar from "./Toolbar/Toolbar";
import Sidebar from "./Sidebar/Sidebar";
import Canvas from "./Canvas/Canvas";
import Properties from "./Properties/Properties";

import { BuilderProvider } from "@/context/form-builder/BuilderContext";

type BuilderProps = {
  storageKey?: string;
  backHref?: string;
  backLabel?: string;
};

export default function Builder({
  storageKey,
  backHref,
  backLabel,
}: BuilderProps = {}) {
  return (
    <BuilderProvider storageKey={storageKey}>
      <main className={`${styles.builder} fbRoot`}>
        <header className={styles.header}>
          <Toolbar backHref={backHref} backLabel={backLabel} />
        </header>

        <section className={styles.content}>
          <aside className={styles.sidebar}>
            <Sidebar />
          </aside>

          <section className={styles.canvas}>
            <Canvas />
          </section>

          <aside className={styles.properties}>
            <Properties />
          </aside>
        </section>
      </main>
    </BuilderProvider>
  );
}