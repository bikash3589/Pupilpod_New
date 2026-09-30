
// "use client";

// import styles from "./Field.module.css";
// import { CanvasNode } from "@/types/form-builder/field";
// import RichTextField from "./RichTextField"; // <-- NEW: the rich-text block component

// interface TextFieldProps {
//   field: CanvasNode;
//   onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
// }

// export default function TextField({ field, onUpdateNode }: TextFieldProps) {
//   // ---------------------------------------------------------------------
//   // NEW: the "text" type is no longer a plain disabled <input>. It's now
//   // a fully editable rich-text block (bold/italic/underline + H1–H6 /
//   // Paragraph). Everything below this early-return is completely
//   // untouched — email, number, date, textarea, checkbox, radio, select,
//   // and file all still work exactly as before.
//   // ---------------------------------------------------------------------
//   if (field.type === "text") {
//     return <RichTextField field={field} onUpdateNode={onUpdateNode} />;
//   }

//   const options = field.options && field.options.length > 0 ? field.options : ["Option 1"];

//   function handleQuestionChange(value: string) {
//     onUpdateNode(field.id, { label: value });
//   }

//   function handleOptionChange(index: number, value: string) {
//     const nextOptions = [...options];
//     nextOptions[index] = value;
//     onUpdateNode(field.id, { options: nextOptions });
//   }
//   function handleAddOption() {
//     onUpdateNode(field.id, {
//       options: [...options, `Option ${options.length + 1}`],
//     });
//   }

//   function handleRemoveOption(index: number) {
//     if (options.length <= 1) return; // keep at least one option
//     const nextOptions = options.filter((_, i) => i !== index);
//     onUpdateNode(field.id, { options: nextOptions });
//   }

//   const isEditableChoiceField = field.type === "select" || field.type === "radio" || field.type === "checkbox";

//   return (
//     <div className={styles.fieldContainer}>
//       {isEditableChoiceField ? (
//         <input
//           type="text"
//           className={styles.questionInput}
//           value={field.label}
//           onChange={(event) => handleQuestionChange(event.target.value)}
//           placeholder="Enter your question"
//           data-no-drag
//         />
//       ) : (
//         <label className={styles.label}>
//           {field.label}
//           {field.required && <span className={styles.required}>*</span>}
//         </label>
//       )}

//       {field.type === "textarea" ? (
//         <textarea className={styles.input} placeholder={field.placeholder} disabled />
//       ) : field.type === "select" ? (
//         <div className={styles.optionGroup}>
//           {options.map((option, index) => (
//             <div key={index} className={styles.optionEditRow}>
//               <span className={styles.optionBullet}>{index + 1}.</span>
//               <input
//                 type="text"
//                 className={styles.optionEditInput}
//                 value={option}
//                 onChange={(event) => handleOptionChange(index, event.target.value)}
//                 placeholder={`Option ${index + 1}`}
//                 data-no-drag
//               />
//               <button
//                 type="button"
//                 className={styles.optionRemoveButton}
//                 onClick={() => handleRemoveOption(index)}
//                 title="Remove option"
//                 data-no-drag
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className={styles.addOptionButton}
//             onClick={handleAddOption}
//             data-no-drag
//           >
//             + Add option
//           </button>
//         </div>
//       ) : field.type === "checkbox" ? (
//         <div className={styles.optionGroup}>
//           {options.map((option, index) => (
//             <div key={index} className={styles.optionEditRow}>
//               <input type="checkbox" className={styles.optionInput} disabled />
//               <input
//                 type="text"
//                 className={styles.optionEditInput}
//                 value={option}
//                 onChange={(event) => handleOptionChange(index, event.target.value)}
//                 placeholder={`Option ${index + 1}`}
//                 data-no-drag
//               />
//               <button
//                 type="button"
//                 className={styles.optionRemoveButton}
//                 onClick={() => handleRemoveOption(index)}
//                 title="Remove option"
//                 data-no-drag
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className={styles.addOptionButton}
//             onClick={handleAddOption}
//             data-no-drag
//           >
//             + Add option
//           </button>
//         </div>
//       ) : field.type === "radio" ? (
//         <div className={styles.optionGroup}>
//           {options.map((option, index) => (
//             <div key={index} className={styles.optionEditRow}>
//               <input type="radio" className={styles.optionInput} disabled />
//               <input
//                 type="text"
//                 className={styles.optionEditInput}
//                 value={option}
//                 onChange={(event) => handleOptionChange(index, event.target.value)}
//                 placeholder={`Option ${index + 1}`}
//                 data-no-drag
//               />
//               <button
//                 type="button"
//                 className={styles.optionRemoveButton}
//                 onClick={() => handleRemoveOption(index)}
//                 title="Remove option"
//                 data-no-drag
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className={styles.addOptionButton}
//             onClick={handleAddOption}
//             data-no-drag
//           >
//             + Add option
//           </button>
//         </div>
//       ) : field.type === "file" ? (
//         <FileUpload fieldId={field.id} />
//       ):(
//         <input
//           type={field.type}
//           className={styles.input}
//           placeholder={field.placeholder}
//           disabled
//         />
//       )}
//     </div>
//   );
// }

// function FileUpload({ fieldId }: { fieldId: string }) {
//   const inputId = `file-${fieldId}`;

//   return (
//     <div className={styles.fileRow}>
//       <label htmlFor={inputId} className={styles.fileButton} data-no-drag>
//         Choose File
//       </label>
//       <span className={styles.fileName}>No file chosen</span>
//       <input id={inputId} type="file" className={styles.fileInput} data-no-drag />
//     </div>
//   );
// }

"use client";
import styles from "./Field.module.css";
import { CanvasNode } from "@/types/form-builder/field";
import RichTextField from "./RichTextField";
import DateField from "./Datefield";
import EmailField from "./EmailField";
import NumberField from "./NumberField";
import TextAreaField from "./TextAreaField";
import FileField from "./FileField";
import { CheckboxGlyph } from "./CustomCheckbox";
import { RadioGlyph } from "./CustomRadio";

interface TextFieldProps {
  field: CanvasNode;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
}

export default function TextField({ field, onUpdateNode }: TextFieldProps) {
  // The "text" type is the fully custom rich-text block — its own
  // component handles everything, so we bail out early here.
  if (field.type === "text") {
    return <RichTextField field={field} onUpdateNode={onUpdateNode} />;
  }

  const options = field.options && field.options.length > 0 ? field.options : ["Option 1"];

  function handleQuestionChange(value: string) {
    onUpdateNode(field.id, { label: value });
  }

  function handleOptionChange(index: number, value: string) {
    const nextOptions = [...options];
    nextOptions[index] = value;
    onUpdateNode(field.id, { options: nextOptions });
  }

  function handleAddOption() {
    onUpdateNode(field.id, {
      options: [...options, `Option ${options.length + 1}`],
    });
  }

  function handleRemoveOption(index: number) {
    if (options.length <= 1) return; // keep at least one option
    const nextOptions = options.filter((_, i) => i !== index);
    onUpdateNode(field.id, { options: nextOptions });
  }

  const isEditableChoiceField = field.type === "select" || field.type === "radio" || field.type === "checkbox";

  return (
    <div className={styles.fieldContainer}>
      {isEditableChoiceField ? (
        <input
          type="text"
          className={styles.questionInput}
          value={field.label}
          onChange={(event) => handleQuestionChange(event.target.value)}
          placeholder="Enter your question"
          data-no-drag
        />
      ) : (
        <label className={styles.label}>
          {field.label}
          {field.required && <span className={styles.required}>*</span>}
        </label>
      )}

      {/* -------------------------------------------------------------
          select / checkbox / radio: this is the OPTION-EDITING view
          (adding/renaming/removing choices) — this is what you see
          while DESIGNING the field on the canvas. The real interactive
          dropdown/checkbox-group/radio-group only shows up later, on
          the live Preview page (see FormPreview.tsx).
      ------------------------------------------------------------- */}
      {field.type === "select" ? (
        <div className={styles.optionGroup}>
          {options.map((option, index) => (
            <div key={index} className={styles.optionEditRow}>
              <span className={styles.optionBullet}>{index + 1}.</span>
              <input
                type="text"
                className={styles.optionEditInput}
                value={option}
                onChange={(event) => handleOptionChange(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                data-no-drag
              />
              <button
                type="button"
                className={styles.optionRemoveButton}
                onClick={() => handleRemoveOption(index)}
                title="Remove option"
                data-no-drag
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className={styles.addOptionButton} onClick={handleAddOption} data-no-drag>
            + Add option
          </button>
        </div>
      ) : field.type === "checkbox" ? (
        <div className={styles.optionGroup}>
          {options.map((option, index) => (
            <div key={index} className={styles.optionEditRow}>
              <CheckboxGlyph />
              <input
                type="text"
                className={styles.optionEditInput}
                value={option}
                onChange={(event) => handleOptionChange(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                data-no-drag
              />
              <button
                type="button"
                className={styles.optionRemoveButton}
                onClick={() => handleRemoveOption(index)}
                title="Remove option"
                data-no-drag
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className={styles.addOptionButton} onClick={handleAddOption} data-no-drag>
            + Add option
          </button>
        </div>
      ) : field.type === "radio" ? (
        <div className={styles.optionGroup}>
          {options.map((option, index) => (
            <div key={index} className={styles.optionEditRow}>
              <RadioGlyph />
              <input
                type="text"
                className={styles.optionEditInput}
                value={option}
                onChange={(event) => handleOptionChange(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                data-no-drag
              />
              <button
                type="button"
                className={styles.optionRemoveButton}
                onClick={() => handleRemoveOption(index)}
                title="Remove option"
                data-no-drag
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className={styles.addOptionButton} onClick={handleAddOption} data-no-drag>
            + Add option
          </button>
        </div>

      // ---------------------------------------------------------------
      // Everything below here is a REAL, functioning component — same
      // one used later in FormPreview.tsx.
      // ---------------------------------------------------------------
      ) : field.type === "textarea" ? (
        <TextAreaField placeholder={field.placeholder} maxLength={field.validation?.maxLength} disabled={true} />
      ) : field.type === "file" ? (
        <FileField disabled={true} />
      // ) : field.type === "date" ? (
      //   <DateField
      //     placeholder={field.placeholder}
      //     minDate={field.validation?.minDate}
      //     maxDate={field.validation?.maxDate}
      //     dateFormat={field.validation?.dateFormat || "MM/DD/YYYY"}
      //     disabled={true}
      //   />
      // )

      ): field.type === "date" ? (
        // `value` comes straight from the node, and `onChange` saves
        // right back onto it — this is what makes whatever date the
        // admin picks here actually stick, instead of disappearing the
        // moment the canvas re-renders or the page reloads.
        <DateField
          value={field.defaultValue}
          onChange={(iso) => onUpdateNode(field.id, { defaultValue: iso })}
          placeholder={field.placeholder}
          minDate={field.validation?.minDate}
          maxDate={field.validation?.maxDate}
          dateFormat={field.validation?.dateFormat || "MM/DD/YYYY"}
        />
      ) :field.type === "email" ? (
        <EmailField placeholder={field.placeholder} pattern={field.validation?.pattern} disabled={true} />
      ) : field.type === "number" ? (
        <NumberField
          placeholder={field.placeholder}
          minDigits={field.validation?.min}
          maxDigits={field.validation?.max}
          step={field.validation?.step}
          disabled={true}
        />
      ) : (
        <input
          type={field.type}
          className={styles.input}
          placeholder={field.placeholder}
          disabled
        />
      )}
    </div>
  );
}