import type { ModuleButton, StaffMember } from "@/types/buttonPermission";

// Buttons registered for the Campaign module (legacy: pupilsightModuleButton
// where pupilsightModuleID = 178) — one row per button actually exposed
// across the Admission/Campaign pages.
export const CAMPAIGN_MODULE_BUTTONS: ModuleButton[] = [
  { id: "add", name: "Add" },
  { id: "edit", name: "Edit" },
  { id: "delete", name: "Delete" },
  { id: "view-application-form", name: "View Application Form" },
  { id: "register-user", name: "Register User" },
  { id: "upload-template", name: "Upload Template" },
  { id: "work-flow", name: "Work Flow" },
  { id: "master-campaign-series", name: "Master Campaign Series" },
  { id: "transition", name: "Transition" },
  { id: "button-permission", name: "Button Permission" },
  { id: "submitted-form", name: "Submitted Form" },
  { id: "invoice", name: "Invoice" },
];

// Active staff available to grant button access to (legacy: pupilsightStaff
// joined to pupilsightPerson). No staff API yet, so this is mocked.
export const STAFF_OPTIONS: StaffMember[] = [
  { id: "staff-1", name: "Anita Sharma" },
  { id: "staff-2", name: "Rahul Verma" },
  { id: "staff-3", name: "Priya Nair" },
  { id: "staff-4", name: "Karthik Iyer" },
  { id: "staff-5", name: "Sneha Reddy" },
  { id: "staff-6", name: "Vikram Singh" },
];
