// Frontend-facing types mirroring prisma/schema.prisma additions described in
// ACADEMIC_DATABASE_SCHEMA.md. Phase A1 (frontend only): these back in-memory mock
// data until the real API/DB layer (lib/domain/academics/*Gateway.ts) lands.

export type ID = number;

// ── Lookups shared across screens ─────────────────────

export interface AcademicYear {
  id: ID;
  name: string;
  isCurrent?: boolean;
}

export interface Program {
  id: ID;
  name: string;
}

export interface YearGroup {
  id: ID;
  programId: ID;
  name: string;
}

export interface RollGroup {
  id: ID;
  yearGroupId: ID;
  name: string;
}

export interface StudentLite {
  id: ID;
  admissionNo: string;
  name: string;
  programId: ID;
  yearGroupId: ID;
  rollGroupId: ID;
}

// ── Subjects / Departments ────────────────────────────

export type DepartmentType =
  | "Learning Area"
  | "Administration"
  | "Scholastic"
  | "Co-Scholastic"
  | "Part A"
  | "Part B";

export interface Department {
  id: ID;
  name: string;
  nameShort?: string;
  type: DepartmentType;
  subjectCode?: string;
  sectionIds: ID[];
  readMin?: number;
  readMedium?: number;
  readMax?: number;
  writeMin?: number;
  writeMedium?: number;
  writeMax?: number;
  memoryMin?: number;
  memoryMedium?: number;
  memoryMax?: number;
  role?: "Coordinator" | "Director";
}

export interface SubjectType {
  id: ID;
  name: string;
}

export type DIMode =
  | "FREE_FORM"
  | "SUBJECT_WISE"
  | "SUBJECT_WISE_NO_EDIT"
  | "SUBJECT_GRADE_WISE"
  | "SUBJECT_GRADE_WISE_AUTO"
  | "NO_DI";

export interface SubjectToClassCurriculum {
  id: ID;
  departmentId: ID;
  programId: ID;
  yearGroupId: ID;
  subjectDisplayName: string;
  subjectCode?: string;
  subjectType: "Core" | "Elective";
  diMode: DIMode;
  position: number;
}

export interface AssignedSubjectToClass {
  id: ID;
  kind: "Core" | "2nd Language" | "3rd Language";
  academicYearId: ID;
  programId: ID;
  yearGroupId: ID;
  departmentId: ID;
}

// ── Skills & Remarks ──────────────────────────────────

export interface Skill {
  id: ID;
  name: string;
  code: string;
  description?: string;
}

export interface SubjectSkillMapping {
  id: ID;
  departmentId: ID;
  skillId: ID;
}

export interface Remark {
  id: ID;
  remarkCode: string;
  description: string;
  departmentId?: ID;
  skillId?: ID;
}

// ── Grade System ──────────────────────────────────────

export interface GradeSystem {
  id: ID;
  name: string;
  code: string;
  passFailCondition: "Marks" | "Grade";
}

export interface GradeSystemConfiguration {
  id: ID;
  gradeSystemId: ID;
  gradeName: string;
  gradePoint: number;
  lowerLimit: number;
  upperLimit: number;
  rank?: number;
  subjectStatus: "Pass" | "Fail";
  classObtained?: "Distinction" | "First Class" | "Second Class" | "Poor";
  description?: string;
  gradeUniqueNo?: string;
}

// ── Electives ──────────────────────────────────────────

export interface ElectiveGroup {
  id: ID;
  name: string;
  orderNo: number;
  minSelection: number;
  maxSelection: number;
  academicYearId: ID;
  programId: ID;
  yearGroupId: ID;
  sectionIds: ID[];
  departmentIds: ID[];
}

// ── Exam Rooms ─────────────────────────────────────────

export interface ExamRoom {
  id: ID;
  name: string;
  code: string;
}

// ── Test Management ───────────────────────────────────

export type AssessmentMethod = "Marks" | "Grade";
export type AssessmentOption = "Radio Button" | "Dropdown";

export interface TestMaster {
  id: ID;
  name: string;
  code: string;
  academicYearId: ID;
}

export interface ExaminationTest {
  id: ID;
  testMasterId?: ID;
  name: string;
  programId: ID;
  yearGroupId: ID;
  rollGroupId?: ID;
  gradeSystemId?: ID;
  assessmentMethod: AssessmentMethod;
  assessmentOption: AssessmentOption;
  maxMarks?: number;
  minMarks?: number;
  enableRemarks: boolean;
  enableSchedule: boolean;
  startDate?: string;
  endDate?: string;
  isShow: boolean;
  enableHtml: boolean;
  enablePdf: boolean;
  enablePublish: boolean;
  enableTestReport: boolean;
  lockMarksEntry: boolean;
}

export interface SubjectToTest {
  id: ID;
  testId: ID;
  departmentId: ID;
  isTested: boolean;
  assessmentMethod: AssessmentMethod;
  maxMarks?: number;
  minMarks?: number;
  enableRemarks: boolean;
  gradeSystemId?: ID;
  roomId?: ID;
  aat: boolean;
  aatCalculationBy?: "Sum" | "Average";
  skillConfig: SubjectToTestSkillConfigure[];
}

export interface SubjectToTestSkillConfigure {
  id: ID;
  skillId: ID;
  weightageType: "None" | "Sum" | "Average" | "Percentage";
  weightage?: number;
}

// ── Marks & lock state ────────────────────────────────

export type AbexValue = "" | "AB" | "EX" | "EX(S)" | "EX(C)";

export interface MarksEntry {
  id: ID;
  testId: ID;
  studentId: ID;
  departmentId: ID;
  skillId?: ID;
  marksObtained?: number | null;
  gradeId?: ID | null;
  abex?: AbexValue;
  remark?: string;
  status: 0 | 1; // 1 = locked/finalized
}

/** Append-only log of prior marksObtained/gradeId values, written whenever a MarksEntry is saved with a changed value (ACADEMIC_DATABASE_SCHEMA.md HistoryOfStudentsMarks). */
export interface MarksHistoryEntry {
  id: ID;
  testId: ID;
  studentId: ID;
  departmentId: ID;
  skillId?: ID;
  marksObtained?: number | null;
  gradeId?: ID | null;
  remark?: string;
  createdAt: string;
}

// ── Sketches / Report Cards ───────────────────────────

export type SketchAttributeCategory =
  | "Entity"
  | "Test"
  | "Computed"
  | "Attendance"
  | "Wired"
  | "Aggregate"
  | "Graph"
  | "External"
  | "Strength";

export interface Sketch {
  id: ID;
  sketchName: string;
  sketchCode: string;
  schoolYearId: ID;
  programIds: ID[];
  yearGroupIds: ID[];
}

export interface SketchAttribute {
  id: ID;
  sketchId: ID;
  attributeName: string;
  attributeCategory: SketchAttributeCategory;
  attributeType: string;
  position: number;
  gradeSystemId?: ID;
  finalFormula?: string;
  canUseForRank: boolean;
}

export interface SketchTemplate {
  id: ID;
  sketchId: ID;
  name: string;
  filename: string;
  programName?: string;
  className?: string;
}

export interface SketchReportConfiguration {
  id: ID;
  sketchId: ID;
  name: string;
  code?: string;
  description?: string;
}

export interface ReportTemplateGlobal {
  id: ID;
  name: string;
  filename: string;
}

export interface StudentTemplateAssignment {
  id: ID;
  studentId: ID;
  testId: ID;
  templateId: ID;
}
