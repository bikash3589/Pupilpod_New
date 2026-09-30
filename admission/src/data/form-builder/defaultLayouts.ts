// 
import { LayoutTemplate } from "@/types/form-builder/layout-template";

export const defaultLayouts: LayoutTemplate[] = [
  {
    id: 1,
    templateId: "header",
    name: "Header",
    category: "layout",
    type: "header",
    description: "Form Heading",
    icon: "▬",
  },

  {
    id: 2,
    templateId: "section",
    name: "Section",
    category: "layout",
    type: "section",
    description: "Group Fields",
    icon: "☰",
  },

  {
    id: 3,
    templateId: "container",
    name: "Container",
    category: "layout",
    type: "container",
    description: "Wrapper",
    icon: "□",
  },

  {
    id: 4,
    templateId: "divider",
    name: "Divider",
    category: "layout",
    type: "divider",
    description: "Separator",
    icon: "―",
  },

  {
    id: 5,
    templateId: "spacer",
    name: "Spacer",
    category: "layout",
    type: "spacer",
    description: "Spacing",
    icon: "⬚",
  },

  {
    id: 6,
    templateId: "grid-1",
    name: "1 Column",
    category: "grid",
    type: "grid-1",
    description: "100%",
    icon: "▉",
  },

  {
    id: 7,
    templateId: "grid-2",
    name: "2 Columns",
    category: "grid",
    type: "grid-2",
    description: "50 / 50",
    icon: "▌▐",
  },

  {
    id: 8,
    templateId: "grid-3",
    name: "3 Columns",
    category: "grid",
    type: "grid-3",
    description: "33 / 33 / 33",
    icon: "▌▌▌",
  },

  {
    id: 9,
    templateId: "grid-4",
    name: "4 Columns",
    category: "grid",
    type: "grid-4",
    description: "25 / 25 / 25 / 25",
    icon: "▌▌▌▌",
  },
];