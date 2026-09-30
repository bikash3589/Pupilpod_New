import {
  ReportTemplateGlobal,
  Sketch,
  SketchAttribute,
  SketchReportConfiguration,
  SketchTemplate,
  StudentTemplateAssignment,
} from "@/types/academics";

export const sketchAttributeCategories: SketchAttribute["attributeCategory"][] = [
  "Entity",
  "Test",
  "Computed",
  "Attendance",
  "Wired",
  "Aggregate",
  "Graph",
  "External",
  "Strength",
];

export const initialSketches: Sketch[] = [
  { id: 1, sketchName: "Half_Yearly_1_5", sketchCode: "Half_Yearly_1_5", schoolYearId: 1, programIds: [1], yearGroupIds: [1, 2, 3] },
  { id: 2, sketchName: "Test1", sketchCode: "Test1", schoolYearId: 1, programIds: [1], yearGroupIds: [1, 2, 3] },
];

export const initialSketchAttributes: SketchAttribute[] = [
  { id: 1, sketchId: 1, attributeName: "Student Name", attributeCategory: "Entity", attributeType: "Text", position: 1, canUseForRank: false },
  { id: 2, sketchId: 1, attributeName: "Admission No", attributeCategory: "Entity", attributeType: "Text", position: 2, canUseForRank: false },
  { id: 3, sketchId: 1, attributeName: "Mathematics Marks", attributeCategory: "Test", attributeType: "Marks", position: 3, gradeSystemId: 1, canUseForRank: true },
  { id: 4, sketchId: 1, attributeName: "Total Marks", attributeCategory: "Computed", attributeType: "Formula", position: 4, finalFormula: "SUM(Test)", canUseForRank: true },
  { id: 5, sketchId: 1, attributeName: "Attendance %", attributeCategory: "Attendance", attributeType: "Percentage", position: 5, canUseForRank: false },
];

export const initialSketchTemplates: SketchTemplate[] = [
  { id: 1, sketchId: 1, name: "Standard A4 Layout", filename: "grade9-standard.pdf" },
];

export const initialSketchReportConfigs: SketchReportConfiguration[] = [
  { id: 1, sketchId: 1, name: "Term 1 Report", code: "T1", description: "Configuration for the first term report card" },
];

export const initialGlobalTemplates: ReportTemplateGlobal[] = [
  { id: 1, name: "Board Exam Certificate", filename: "board-certificate.pdf" },
  { id: 2, name: "Transfer Certificate", filename: "transfer-certificate.pdf" },
];

export const initialStudentTemplateAssignments: StudentTemplateAssignment[] = [
  { id: 1, studentId: 1, testId: 1, templateId: 1 },
];
