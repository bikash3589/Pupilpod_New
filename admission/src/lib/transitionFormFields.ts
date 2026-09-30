import type { CanvasNode } from "@/types/form-builder/field";

export interface FormFieldOption {
  name: string;
  label: string;
  showInGrid: boolean;
}

const FIELD_TYPES = new Set([
  "text",
  "email",
  "number",
  "date",
  "textarea",
  "checkbox",
  "radio",
  "select",
  "file",
  "input",
]);

// Flattens the campaign's saved form-builder canvas (incl. nested layout
// groups) into a flat field list, always prefixed with a synthetic
// application_no — mirrors transitionProcess.php's Fluent Form flattening.
export function getFluentFormFields(campaignId: string): FormFieldOption[] {
  const fields: FormFieldOption[] = [
    { name: "application_no", label: "Application No", showInGrid: false },
  ];

  if (typeof window === "undefined" || !campaignId) return fields;

  try {
    const raw = localStorage.getItem(`formbuilder-canvas-campaign-${campaignId}`);
    const nodes: CanvasNode[] = raw ? JSON.parse(raw) : [];

    const walk = (list: CanvasNode[]) => {
      for (const node of list) {
        if (FIELD_TYPES.has(node.type)) {
          const name = node.fieldId?.trim() || node.id;
          const label = node.label?.trim() || name;
          fields.push({ name, label, showInGrid: node.showInGrid ?? false });
        }
        if (node.children?.length) walk(node.children);
      }
    };

    walk(nodes);
  } catch (err) {
    console.error("Failed to read campaign form fields from localStorage", err);
  }

  return fields;
}
