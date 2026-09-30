// export type LayoutCategory =
//   | "layout"
//   | "grid";

// export type LayoutTemplateType =
//   | "header"
//   | "section"
//   | "container"
//   | "divider"
//   | "spacer"
//   | "grid-1"
//   | "grid-2"
//   | "grid-3"
//   | "grid-4";

// export interface LayoutTemplate {
//   id: number;

//   templateId: string;

//   name: string;

//   category: LayoutCategory;

//   type: LayoutTemplateType;

//   description: string;
// }
export type LayoutCategory =
  | "layout"
  | "grid";

export type LayoutTemplateType =
  | "header"
  | "section"
  | "container"
  | "divider"
  | "spacer"
  | "grid-1"
  | "grid-2"
  | "grid-3"
  | "grid-4";

export interface LayoutTemplate {
  id: number;

  templateId: string;

  name: string;

  category: LayoutCategory;

  type: LayoutTemplateType;

  description: string;

  icon: string;
}