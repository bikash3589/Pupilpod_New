import { Field } from "./field";

export type LayoutType =
  | "header"
  | "section"
  | "container"
  | "row"
  | "column"
  | "divider"
  | "spacer";

export interface CanvasItemBase {
  id: string;

  parentId: string | null;

  order: number;

  itemType: "layout" | "field";
}

/* ------------------------- */
/* Layout Items              */
/* ------------------------- */

export interface LayoutItem
  extends CanvasItemBase {
  itemType: "layout";

  layoutType: LayoutType;

  title: string;

  children: CanvasItem[];
}

/* ------------------------- */
/* Field Items               */
/* ------------------------- */

export interface FieldItem
  extends CanvasItemBase {
  itemType: "field";

  field: Field;
}

/* ------------------------- */
/* Canvas Item               */
/* ------------------------- */

export type CanvasItem =
  | LayoutItem
  | FieldItem;