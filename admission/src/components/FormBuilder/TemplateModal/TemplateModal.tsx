"use client";

import styles from "./TemplateModal.module.css";

import useTemplateForm from "@/hooks/form-builder/useTemplateForm";

import { useBuilderContext } from "@/context/form-builder/BuilderContext";
import { FieldType } from "@/types/form-builder/field";
import { FieldTemplate } from "@/types/form-builder/field-template";


interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TemplateModal({
  open,
  onClose,
}: TemplateModalProps)
 {
  const {
    template,
    updateField,
    validate,
    buildTemplate,
    resetForm,
  } = useTemplateForm();


  const { addTemplate } = useBuilderContext();

  // ---------- NEW CODE STARTS HERE ----------

  // Does the currently chosen Field Type need a list of options?
  // (Select, Radio, and Checkbox all need choices; the rest don't.)
  const needsOptions =
    template.type === "select" ||
    template.type === "radio" ||
    template.type === "checkbox";

  // Always work with a safe list, even if defaultOptions is empty.
  const options =
    template.defaultOptions.length > 0
      ? template.defaultOptions
      : ["Option 1"];

  // Change the text of one specific option.
  function handleOptionChange(index: number, value: string) {
    const nextOptions = [...options];
    nextOptions[index] = value;
    updateField("defaultOptions", nextOptions);
  }

  // Add a brand new blank option to the end of the list.
  function handleAddOption() {
    updateField("defaultOptions", [
      ...options,
      `Option ${options.length + 1}`,
    ]);
  }

  // Remove one option (but never let the list go completely empty).
  function handleRemoveOption(index: number) {
    if (options.length <= 1) return;
    updateField(
      "defaultOptions",
      options.filter((_, i) => i !== index)
    );
  }

  // ---------- NEW CODE ENDS HERE ----------

  if (!open) return null;

  function handleSave() {
    if (!validate()) return;

    addTemplate(buildTemplate());

    resetForm();

    onClose();
}
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create New Field</h2>

          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <label>Field Name</label>

          <input
            type="text"
            value={template.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
          />

          <label>Field ID</label>

          <input
            type="text"
            value={template.templateId}
            onChange={(event) =>
              updateField("templateId", event.target.value)
            }
          />

          <label>Field Type</label>

          <select
            value={template.type}
            onChange={(event) =>
              updateField("type", event.target.value as FieldType)
            }
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="textarea">Textarea</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="select">Select</option>
            <option value="file">File</option>
          </select>

          <label>Default Label</label>

          <input
            type="text"
            value={template.defaultLabel}
            onChange={(event) =>
              updateField(
                "defaultLabel",
                event.target.value
              )
            }
          />

          <label>Placeholder</label>

          <input
            type="text"
            value={template.defaultPlaceholder}
            onChange={(event) =>
              updateField(
                "defaultPlaceholder",
                event.target.value
              )
            }
          />

          <label>Width</label>

          <select
            value={template.defaultWidth}
            onChange={(event) =>
              updateField(
                "defaultWidth",
                event.target.value as FieldTemplate["defaultWidth"]
              )
            }
          >
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>

          {/* ---------- NEW SECTION STARTS HERE ---------- */}
          {/* Only show this box if the field type actually needs options */}
          {needsOptions && (
            <div className={styles.optionsSection}>
              <label>Options</label>

              {options.map((option, index) => (
                <div key={index} className={styles.optionRow}>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) =>
                      handleOptionChange(index, event.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.removeOptionButton}
                    onClick={() => handleRemoveOption(index)}
                    title="Remove this option"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={styles.addOptionButton}
                onClick={handleAddOption}
              >
                + Add Option
              </button>
            </div>
          )}
          {/* ---------- NEW SECTION ENDS HERE ---------- */}

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={template.defaultRequired}
              onChange={(event) =>
                updateField(
                  "defaultRequired",
                  event.target.checked
                )
              }
            />

            Required
          </label>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancel}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className={styles.save}
            onClick={handleSave}
          >
            Save Field
          </button>
        </div>
      </div>
    </div>
  );
}