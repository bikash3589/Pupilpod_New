import { getFluentFormFields } from "./transitionFormFields";
import type { TemplateFieldReference } from "@/types/uploadTemplate";

// Sub-feature B (form_template_fields.php equivalent) — read-only merge-tag
// cheat sheet, regenerated from the campaign's saved form fields on every
// read. Reuses the same field-flattening as the Transition module's field
// mapping screen (transitionFormFields.ts) since this app's form-builder
// canvas is the local equivalent of the legacy Fluent Form schema.
export function getTemplateFieldReference(campaignId: string): TemplateFieldReference[] {
  return getFluentFormFields(campaignId).map(({ name, label }) => ({
    fieldName: name,
    label,
    placeholder: `\${${name}}`,
  }));
}
