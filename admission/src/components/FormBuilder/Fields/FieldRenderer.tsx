"use client";

import { CanvasNode } from "@/types/form-builder/field";

import TextField from "./TextField";

interface FieldRendererProps {
  field: CanvasNode;
 onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
}

export default function FieldRenderer({
  field,onUpdateNode,
}: FieldRendererProps) {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
    case "textarea":
    case "checkbox":
    case "radio":
    case "select":
    case "file":
      return (
        <TextField field={field} onUpdateNode={onUpdateNode}/>
      );

    default:
      return (
        <TextField field={field} onUpdateNode={onUpdateNode}/>
      );
  }
}
