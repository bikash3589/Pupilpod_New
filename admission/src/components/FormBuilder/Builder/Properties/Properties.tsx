// "use client";

// import { useBuilderContext } from "@/context/form-builder/BuilderContext";
// import styles from "./Properties.module.css";
// import { CanvasNode } from "@/types/form-builder/field";

// export default function Properties() {
//   const { nodes, selectedNodeId, updateNode } = useBuilderContext();

//   const selectedNode = nodes.find((node) => node.id === selectedNodeId);
// // const isRichTextType = selectedNode.type === "text";

//   // Nothing selected yet — show the placeholder message.
//   if (!selectedNode) {
//     return (
//       <div className={styles.properties}>
//         <h2>Properties</h2>
//         <p>Select a field to edit its properties.</p>
//       </div>
//     );
//   }

//   // Checks if another field already uses this exact Field ID.
//   function isFieldIdTaken(candidateId: string): boolean {
//     return nodes.some(
//       (node) => node.id !== selectedNode!.id && node.fieldId === candidateId
//     );
//   }

//   // Small helper: updates just the `validation` object on the node,
//   // keeping any other validation values that are already set.
//   function updateValidation(key: string, value: number | string | undefined) {
//     updateNode(selectedNode!.id, {
//       validation: {
//         ...selectedNode!.validation,
//         [key]: value,
//       },
//     });
//   }

//   // These field types don't need Label/Placeholder editing here
//   // because they're already edited directly on the canvas
//   // (Header, and the choice fields which have their own options editor).
//   const isLayoutType = [
//     "header", "section", "container", "divider", "spacer",
//     "grid-1", "grid-2", "grid-3", "grid-4",
//   ].includes(selectedNode.type);

//   const isChoiceType =
//     selectedNode.type === "select" ||
//     selectedNode.type === "radio" ||
//     selectedNode.type === "checkbox";
//     const isRichTextType = selectedNode.type === "text";

//   return (
//     <div className={styles.properties}>
//       <h2>Properties</h2>

//       {isLayoutType ? (
//         <p className={styles.hint}>This item is edited directly on the canvas.</p>
//       ) : (
//         <>
//           {/* ---------- Unique ID (system-generated, locked) ---------- */}
//           <div className={styles.group}>
//             <label className={styles.fieldLabel}>Unique ID</label>
//             <input
//               type="text"
//               className={`${styles.input} ${styles.disabledInput}`}
//               value={selectedNode.id}
//               disabled
//               readOnly
//             />
//             <p className={styles.hint}>
//               Auto-generated when this field was created. Cannot be changed.
//             </p>
//           </div>

//           {/* ---------- Field ID (admin-editable, used as the JSON key) ---------- */}
//           <div className={styles.group}>
//             <label className={styles.fieldLabel}>Field ID</label>
//             <input
//               type="text"
//               className={styles.input}
//               value={selectedNode.fieldId ?? ""}
//               onChange={(event) => {
//                 const nextId = event.target.value.trim();
//                 updateNode(selectedNode.id, { fieldId: nextId });
//               }}
//               placeholder="e.g. parent_phone"
//             />
//             {selectedNode.fieldId && isFieldIdTaken(selectedNode.fieldId) && (
//               <p className={styles.errorText}>
//                 This Field ID is already used by another field. Submission data may overwrite it — please make it unique.
//               </p>
//             )}
//             <p className={styles.hint}>
//               This is the key used when form answers are saved (e.g. in JSON/database).
//               Use only letters, numbers, and underscores.
//             </p>
//           </div>

//           {/* ---------- Basic settings, shown for every field type ---------- */}
//           <div className={styles.group}>
//             <label className={styles.fieldLabel}>Label</label>
//             <input
//               type="text"
//               className={styles.input}
//               value={selectedNode.label}
//               onChange={(event) => updateNode(selectedNode.id, { label: event.target.value })}
//             />
//           </div>

//           {!isChoiceType && (
//             <div className={styles.group}>
//               <label className={styles.fieldLabel}>Placeholder</label>
//               <input
//                 type="text"
//                 className={styles.input}
//                 value={selectedNode.placeholder}
//                 onChange={(event) => updateNode(selectedNode.id, { placeholder: event.target.value })}
//               />
//             </div>
//           )}

//           <div className={styles.group}>
//             <label className={styles.checkboxRow}>
//               <input
//                 type="checkbox"
//                 checked={selectedNode.required}
//                 onChange={(event) => updateNode(selectedNode.id, { required: event.target.checked })}
//               />
//               Required
//             </label>
//           </div>

//           <div className={styles.group}>
//             <label className={styles.fieldLabel}>Help Text</label>
//             <input
//               type="text"
//               className={styles.input}
//               value={selectedNode.helpText ?? ""}
//               onChange={(event) => updateNode(selectedNode.id, { helpText: event.target.value })}
//               placeholder="Optional note shown below the field"
//             />
//           </div>

//           {/* ---------- Validation, different per field type ---------- */}

//           {(selectedNode.type === "text" || selectedNode.type === "textarea") && (
//             <div className={styles.group}>
//               <label className={styles.fieldLabel}>Validation</label>
//               <div className={styles.row}>
//                 <div className={styles.rowItem}>
//                   <span className={styles.smallLabel}>Min length</span>
//                   <input
//                     type="number"
//                     className={styles.input}
//                     min={0}
//                     value={selectedNode.validation?.minLength ?? ""}
//                     onChange={(event) =>
//                       updateValidation("minLength", event.target.value === "" ? undefined : Number(event.target.value))
//                     }
//                   />
//                 </div>
//                 <div className={styles.rowItem}>
//                   <span className={styles.smallLabel}>Max length</span>
//                   <input
//                     type="number"
//                     className={styles.input}
//                     min={0}
//                     value={selectedNode.validation?.maxLength ?? ""}
//                     onChange={(event) =>
//                       updateValidation("maxLength", event.target.value === "" ? undefined : Number(event.target.value))
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {selectedNode.type === "number" && (
//             <div className={styles.group}>
//               <label className={styles.fieldLabel}>Validation</label>
//               <div className={styles.row}>
//                 <div className={styles.rowItem}>
//                   <span className={styles.smallLabel}>Min value</span>
//                   <input
//                     type="number"
//                     className={styles.input}
//                     value={selectedNode.validation?.min ?? ""}
//                     onChange={(event) =>
//                       updateValidation("min", event.target.value === "" ? undefined : Number(event.target.value))
//                     }
//                   />
//                 </div>
//                 <div className={styles.rowItem}>
//                   <span className={styles.smallLabel}>Max value</span>
//                   <input
//                     type="number"
//                     className={styles.input}
//                     value={selectedNode.validation?.max ?? ""}
//                     onChange={(event) =>
//                       updateValidation("max", event.target.value === "" ? undefined : Number(event.target.value))
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {selectedNode.type === "email" && (
//             <div className={styles.group}>
//               <label className={styles.fieldLabel}>Validation</label>
//               <p className={styles.hint}>
//                 Email format is checked automatically. You can also add a custom pattern below (optional).
//               </p>
//               <input
//                 type="text"
//                 className={styles.input}
//                 placeholder="Custom regex pattern (optional)"
//                 value={selectedNode.validation?.pattern ?? ""}
//                 onChange={(event) => updateValidation("pattern", event.target.value || undefined)}
//               />
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


"use client";

import { useBuilderContext } from "@/context/form-builder/BuilderContext";
import { CanvasNode } from "@/types/form-builder/field";
import styles from "./Properties.module.css";

export default function Properties() {
  const { nodes, selectedNodeId, updateNode } = useBuilderContext();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  // Nothing selected yet — show the placeholder message.
  if (!selectedNode) {
    return (
      <div className={styles.properties}>
        <h2>Properties</h2>
        <p>Select a field to edit its properties.</p>
      </div>
    );
  }

  // Checks if another field already uses this exact Field ID.
  function isFieldIdTaken(candidateId: string): boolean {
    return nodes.some(
      (node) => node.id !== selectedNode!.id && node.fieldId === candidateId
    );
  }

  // Small helper: updates just the `validation` object on the node,
  // keeping any other validation values that are already set.
  function updateValidation(key: string, value: number | string | undefined) {
    updateNode(selectedNode!.id, {
      validation: {
        ...selectedNode!.validation,
        [key]: value,
      },
    });
  }

  // These field types don't need Label/Placeholder editing here
  // because they're already edited directly on the canvas
  // (Header, the choice fields which have their own options editor,
  // and now the rich-text Text field too).
  const isLayoutType = [
    "header", "section", "container", "divider", "spacer",
    "grid-1", "grid-2", "grid-3", "grid-4",
  ].includes(selectedNode.type);

  const isChoiceType =
    selectedNode.type === "select" ||
    selectedNode.type === "radio" ||
    selectedNode.type === "checkbox";

  // NEW: the Text field now uses rich-text editing directly on the
  // canvas (headings, bold, italic, etc), so its Label/Placeholder
  // boxes here are hidden, and a "Text style" dropdown is shown
  // instead, letting the admin pick Paragraph or Heading 1–6.
  const isRichTextType = selectedNode.type === "text";

  return (
    <div className={styles.properties}>
      <h2>Properties</h2>

      {isLayoutType ? (
        <p className={styles.hint}>This item is edited directly on the canvas.</p>
      ) : (
        <>
          {/* ---------- Unique ID (system-generated, locked) ---------- */}
          <div className={styles.group}>
            <label className={styles.fieldLabel}>Unique ID</label>
            <input
              type="text"
              className={`${styles.input} ${styles.disabledInput}`}
              value={selectedNode.id}
              disabled
              readOnly
            />
            <p className={styles.hint}>
              Auto-generated when this field was created. Cannot be changed.
            </p>
          </div>

          {/* ---------- Field ID (admin-editable, used as the JSON key) ---------- */}
          <div className={styles.group}>
            <label className={styles.fieldLabel}>Field ID</label>
            <input
              type="text"
              className={styles.input}
              value={selectedNode.fieldId ?? ""}
              onChange={(event) => {
                const nextId = event.target.value.trim();
                updateNode(selectedNode.id, { fieldId: nextId });
              }}
              placeholder="e.g. parent_phone"
            />
            {selectedNode.fieldId && isFieldIdTaken(selectedNode.fieldId) && (
              <p className={styles.errorText}>
                This Field ID is already used by another field. Submission data may overwrite it — please make it unique.
              </p>
            )}
            <p className={styles.hint}>
              This is the key used when form answers are saved (e.g. in JSON/database).
              Use only letters, numbers, and underscores.
            </p>
          </div>

          {/* ---------- NEW: Text style (Paragraph / Heading 1–6) ---------- */}
          {/* Only shown for the rich-text Text field. */}
          {isRichTextType && (
            <div className={styles.group}>
              <label className={styles.fieldLabel}>Text style</label>

              <select
                className={styles.input}
                value={selectedNode.blockType ?? "p"}
                onChange={(event) =>
                  updateNode(selectedNode.id, {
                    blockType: event.target.value as CanvasNode["blockType"],
                    // height: "auto", // let the box resize to fit the new text size immediately
                    height: "auto", // let the box resize to fit the new text size immediately
                  })
                }
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>
          )}

          {/* ---------- Basic settings, shown for every field type ---------- */}
          {/* Label is hidden for rich-text fields — you type directly
              on the canvas instead of through this box. */}
          {/* {!isRichTextType && ( */}
            <div className={styles.group}>
              <label className={styles.fieldLabel}>Label</label>
              <input
                type="text"
                className={styles.input}
                value={selectedNode.label}
                onChange={(event) => updateNode(selectedNode.id, { label: event.target.value })}
              />
            </div>
          {/* )} */}

          {/* Placeholder doesn't apply to choice fields or rich-text fields. */}
          {!isChoiceType && !isRichTextType && (
            <div className={styles.group}>
              <label className={styles.fieldLabel}>Placeholder</label>
              <input
                type="text"
                className={styles.input}
                value={selectedNode.placeholder}
                onChange={(event) => updateNode(selectedNode.id, { placeholder: event.target.value })}
              />
            </div>
          )} 

          <div className={styles.group}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={selectedNode.required}
                onChange={(event) => updateNode(selectedNode.id, { required: event.target.checked })}
              />
              Required
            </label>
          </div>

          {!isRichTextType && (
            <div className={styles.group}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selectedNode.showInGrid ?? false}
                  onChange={(event) =>
                    updateNode(selectedNode.id, { showInGrid: event.target.checked })
                  }
                />
                Show in Grid
              </label>
              <p className={styles.hint}>
                Includes this field in the Submitted Form list&apos;s Requested Grid view.
              </p>
            </div>
          )}

          <div className={styles.group}>
            <label className={styles.fieldLabel}>Help Text</label>
            <input
              type="text"
              className={styles.input}
              value={selectedNode.helpText ?? ""}
              onChange={(event) => updateNode(selectedNode.id, { helpText: event.target.value })}
              placeholder="Optional note shown below the field"
            />
          </div>

          {/* ---------- Validation, different per field type ---------- */}

          {(selectedNode.type === "text" || selectedNode.type === "textarea") && (
            <div className={styles.group}>
              <label className={styles.fieldLabel}>Validation</label>
              <div className={styles.row}>
                <div className={styles.rowItem}>
                  <span className={styles.smallLabel}>Min length</span>
                  <input
                    type="number"
                    className={styles.input}
                    min={0}
                    value={selectedNode.validation?.minLength ?? ""}
                    onChange={(event) =>
                      updateValidation("minLength", event.target.value === "" ? undefined : Number(event.target.value))
                    }
                  />
                </div>
                <div className={styles.rowItem}>
                  <span className={styles.smallLabel}>Max length</span>
                  <input
                    type="number"
                    className={styles.input}
                    min={0}
                    value={selectedNode.validation?.maxLength ?? ""}
                    onChange={(event) =>
                      updateValidation("maxLength", event.target.value === "" ? undefined : Number(event.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {selectedNode.type === "number" && (
            <div className={styles.group}>
              <label className={styles.fieldLabel}>Validation</label>
              <div className={styles.row}>
                <div className={styles.rowItem}>
                  <span className={styles.smallLabel}>Min value</span>
                  <input
                    type="number"
                    className={styles.input}
                    value={selectedNode.validation?.min ?? ""}
                    onChange={(event) =>
                      updateValidation("min", event.target.value === "" ? undefined : Number(event.target.value))
                    }
                  />
                </div>
                <div className={styles.rowItem}>
                  <span className={styles.smallLabel}>Max value</span>
                  <input
                    type="number"
                    className={styles.input}
                    value={selectedNode.validation?.max ?? ""}
                    onChange={(event) =>
                      updateValidation("max", event.target.value === "" ? undefined : Number(event.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {selectedNode.type === "email" && (
            <div className={styles.group}>
              <label className={styles.fieldLabel}>Validation</label>
              <p className={styles.hint}>
                Email format is checked automatically. You can also add a custom pattern below (optional).
              </p>
              <input
                type="text"
                className={styles.input}
                placeholder="Custom regex pattern (optional)"
                value={selectedNode.validation?.pattern ?? ""}
                onChange={(event) => updateValidation("pattern", event.target.value || undefined)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}