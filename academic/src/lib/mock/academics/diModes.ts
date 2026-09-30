import { DIMode } from "@/types/academics";

/** Display labels for the fixed DIMode enum (see ACADEMIC_DATABASE_SCHEMA.md — diMode is a plain string on SubjectToClassCurriculum, not a manageable master list). */
export const diModeOptions: { code: DIMode; label: string; description: string }[] = [
  { code: "FREE_FORM", label: "Free Form", description: "No DI restrictions — teachers enter any subject freely." },
  { code: "SUBJECT_WISE", label: "Subject Wise", description: "DI is tracked per subject and editable." },
  { code: "SUBJECT_WISE_NO_EDIT", label: "Subject Wise (No Edit)", description: "DI is tracked per subject but locked from editing." },
  { code: "SUBJECT_GRADE_WISE", label: "Subject & Grade Wise", description: "DI depends on both subject and grade band." },
  { code: "SUBJECT_GRADE_WISE_AUTO", label: "Subject & Grade Wise (Auto)", description: "Subject & grade wise DI computed automatically." },
  { code: "NO_DI", label: "No DI", description: "DI is disabled for this subject/class combination." },
];
