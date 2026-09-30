/* ------------------------------------------------ */
/* Field Types                                      */
/* ------------------------------------------------ */

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "textarea"
  | "checkbox"
  | "radio"
  | "select"
  | "file"
  // | "input" =>newly added one
  |"input"
  ;

/* ------------------------------------------------ */
/* Layout Types                                     */
/* ------------------------------------------------ */

export type LayoutType =
  | "header"
  | "section"
  | "container"
  | "divider"
  | "spacer"
  | "grid-1"
  | "grid-2"
  | "grid-3"
  | "grid-4";

/* ------------------------------------------------ */
/* Canvas Types                                     */
/* ------------------------------------------------ */

export type CanvasNodeType = FieldType | LayoutType;

/* ------------------------------------------------ */
/* Existing Field Model                             */
/* ------------------------------------------------ */

export interface Field {
  id: string;

  type: FieldType;

  label: string;

  placeholder: string;

  required: boolean;

  width: number;

  options: string[];

  helpText?: string;

  fieldId?: string;

}

/* ------------------------------------------------ */
/* Canvas Node                                      */
/* ------------------------------------------------ */

export interface CanvasNode {
  id: string;
   defaultValue?: string; // the admin-picked default (currently used by the Date field)
  type: CanvasNodeType;

  parentId: string | null;
  // logoUrl?: string;
logoUrl?: string;
  logoPosition?: { x: number; y: number }; // where the logo sits inside the header box, in pixels
  logoSize?: number; // width & height of the logo box, in pixels (it's always square)
  position?: {
    x: number;
    y: number;
  };

  children: CanvasNode[];

  label: string;

  placeholder: string;

  required: boolean;

  width: number;

  options: string[];

  helpText?: string;

  fieldId?: string;

  // Flags this field to appear in the Submitted Form list's "Requested
  // Grid" view (alongside the always-shown Quick columns) — the admin
  // opts individual fields into that compact-but-more-than-Quick view.
  showInGrid?: boolean;

  height: number | "auto";

  selected: boolean;

  locked: boolean;

  hidden: boolean;

  styles: {
    background?: string;
    color?: string;
    borderRadius?: number;
    borderColor?: string;
  };

  validation: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;      // <-- NEW
   pattern?: string;
  minDate?: string;   // <-- NEW: "YYYY-MM-DD"
  maxDate?: string;   // <-- NEW: "YYYY-MM-DD"
  dateFormat?: string; // <-- NEW: e.g. "MM/DD/YYYY"
  };
  // blockType?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; this is for the Textpreview field extra features
  blockType?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  richText?: string;
}
