"use client";

// The fillable counterpart to FormPreview.tsx — same canvas-walking layout
// logic (grids/sections/headers/dividers/text blocks render identically),
// but every actual input field is a real controlled control instead of
// FormPreview's decorative, state-of-its-own preview widgets. This is what
// "Apply" opens: the campaign's own designed form, actually fillable.
//
// Each field's captured value is keyed by `fieldId?.trim() || id` — the
// same scheme transitionFormFields.ts's getFluentFormFields() uses — so the
// values this produces line up with the field names the rest of the
// Submitted Form module (grid columns, Advance Search) already knows about.
//
// File fields are rendered for visual parity but not captured into the
// submitted values — this app has no per-submission file storage yet
// (only the separate campaign-template upload feature does).

import { useEffect, useState } from "react";
import { CanvasNode, LayoutType } from "@/types/form-builder/field";
import "../variable.css";
import "../reset.css";
import styles from "./FormPreview.module.css";
import FileField from "@/components/FormBuilder/Fields/FileField";

const grids = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);
const layouts = new Set<LayoutType>([
  "header", "section", "container", "divider", "spacer", ...grids,
]);

function fieldKey(node: CanvasNode): string {
  return node.fieldId?.trim() || node.id;
}

interface FormFillProps {
  storageKey: string;
  onSubmit: (values: Record<string, string>) => void;
  submitLabel?: string;
}

export default function FormFill({
  storageKey,
  onSubmit,
  submitLabel = "Submit Application",
}: FormFillProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setNodes(raw ? (JSON.parse(raw) as CanvasNode[]) : []);
    } catch {
      setNodes([]);
    } finally {
      setHasLoaded(true);
    }
  }, [storageKey]);

  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  function Control({ node }: { node: CanvasNode }) {
    const key = fieldKey(node);
    const value = values[key] ?? "";

    if (node.type === "textarea") {
      return (
        <textarea
          placeholder={node.placeholder}
          maxLength={node.validation?.maxLength}
          value={value}
          onChange={(e) => setValue(key, e.target.value)}
        />
      );
    }

    if (node.type === "select") {
      return (
        <select value={value} onChange={(e) => setValue(key, e.target.value)}>
          <option value="" disabled>
            {node.placeholder || "Select an option"}
          </option>
          {node.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (node.type === "file") {
      return <FileField />;
    }

    return (
      <input
        type={node.type === "date" ? "date" : node.type}
        placeholder={node.placeholder}
        value={value}
        onChange={(e) => setValue(key, e.target.value)}
      />
    );
  }

  function renderNode(node: CanvasNode): React.ReactNode {
    const children = nodes.filter((item) => item.parentId === node.id);

    if (grids.has(node.type as LayoutType)) {
      return (
        <div
          key={node.id}
          className={styles.grid}
          style={{
            gridTemplateColumns: children
              .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
              .join(" "),
          }}
        >
          {children.map((column) => (
            <div key={column.id} className={styles.column}>
              {nodes.filter((item) => item.parentId === column.id).map(renderNode)}
            </div>
          ))}
        </div>
      );
    }

    if (node.type === "checkbox" || node.type === "radio") {
      const options = node.options.length > 0 ? node.options : ["Option 1"];
      const key = fieldKey(node);
      const selected = new Set((values[key] ?? "").split(",").filter(Boolean));

      const toggle = (option: string) => {
        if (node.type === "radio") {
          setValue(key, option);
          return;
        }
        const next = new Set(selected);
        if (next.has(option)) next.delete(option);
        else next.add(option);
        setValue(key, [...next].join(","));
      };

      return (
        <div key={node.id} className={styles.field}>
          <span>{node.label}{node.required && <b> *</b>}</span>
          <div className={styles.choiceGroup}>
            {options.map((option, index) => (
              <label key={index} className={styles.choiceRow}>
                <input
                  type={node.type}
                  name={key}
                  checked={node.type === "radio" ? values[key] === option : selected.has(option)}
                  onChange={() => toggle(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {node.helpText && <small>{node.helpText}</small>}
        </div>
      );
    }

    if (node.type === "header") {
      const size = node.logoSize ?? 64;
      const pos = node.logoPosition ?? { x: 20, y: 20 };
      return (
        <header key={node.id} className={styles.header} style={{ position: "relative", minHeight: 160 }}>
          {node.logoUrl && (
            <img
              src={node.logoUrl}
              alt="Form logo"
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: size,
                height: size,
                objectFit: "contain",
              }}
            />
          )}
          <div className={styles.headerTextArea}>
            <h1>{node.label}</h1>
            {node.helpText && <p>{node.helpText}</p>}
          </div>
        </header>
      );
    }

    if (node.type === "text") {
      const Tag = (node.blockType ?? "p") as "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag key={node.id} className={styles.richText} dangerouslySetInnerHTML={{ __html: node.richText ?? node.label }} />
      );
    }

    if (node.type === "divider") return <hr key={node.id} />;
    if (node.type === "spacer") return <div key={node.id} className={styles.spacer} />;

    if (layouts.has(node.type as LayoutType)) {
      return (
        <section key={node.id} className={styles.layout}>
          <h2>{node.label}</h2>
          {children.map(renderNode)}
        </section>
      );
    }

    return (
      <label key={node.id} className={styles.field}>
        <span>{node.label}{node.required && <b> *</b>}</span>
        <Control node={node} />
        {node.helpText && <small>{node.helpText}</small>}
      </label>
    );
  }

  if (!hasLoaded) return <main className={styles.preview} />;

  const rootNodes = nodes.filter((node) => node.parentId === null);

  return (
    <main className={`${styles.preview} fbRoot`}>
      {rootNodes.length ? (
        <>
          {rootNodes.map(renderNode)}
          <button
            type="button"
            className="navigationButton"
            onClick={() => onSubmit(values)}
          >
            {submitLabel}
          </button>
        </>
      ) : (
        <p>This campaign&apos;s application form has no fields yet.</p>
      )}
    </main>
  );
}
