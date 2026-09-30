"use client";

import { useState } from "react";

import { FieldTemplate } from "@/types/form-builder/field-template";
import { FieldType } from "@/types/form-builder/field";

const initialState = {
  id: 0,
  templateId: "",
  name: "",
  builtIn: false,
  type: "text" as FieldType,
  defaultLabel: "",
  defaultPlaceholder: "",
  defaultRequired: false,
  defaultWidth: "100" as "25" | "50" | "75" | "100",
  defaultOptions: [],
};

export default function useTemplateForm() {
  const [template, setTemplate] =
    useState<FieldTemplate>(initialState);

  function updateField<K extends keyof FieldTemplate>(
    key: K,
    value: FieldTemplate[K]
  ) {
    setTemplate((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function resetForm() {
    setTemplate(initialState);
  }

  function validate() {
    if (template.name.trim() === "") {
      alert("Field Name is required");
      return false;
    }

    if (template.templateId.trim() === "") {
      alert("Field ID is required");
      return false;
    }

    if (template.defaultLabel.trim() === "") {
      alert("Default Label is required");
      return false;
    }

    return true;
  }

  function buildTemplate(): FieldTemplate {
    return {
      ...template,
      id: Date.now(),
    };
  }

  return {
    template,

    updateField,

    validate,

    buildTemplate,

    resetForm,
  };
}