import { createListStore } from "@/lib/mock/createListStore";
import { initialDepartments } from "./subjects";
import { initialSubjectTypes } from "./subjects";
import { initialSkills, initialRemarks, initialSubjectSkillMappings } from "./skillsRemarks";
import { initialGradeSystems, initialGradeBands } from "./gradeSystems";
import { initialElectiveGroups } from "./electives";
import { initialExamRooms } from "./examRooms";
import { initialTestMasters, initialTests, initialSubjectToTest } from "./tests";
import { initialMarks, initialMarksHistory } from "./marks";
import {
  initialSketches,
  initialSketchAttributes,
  initialSketchTemplates,
  initialSketchReportConfigs,
  initialGlobalTemplates,
  initialStudentTemplateAssignments,
} from "./sketches";
import {
  Department,
  SubjectType,
  Skill,
  Remark,
  GradeSystem,
  GradeSystemConfiguration,
  ElectiveGroup,
  ExamRoom,
  TestMaster,
  ExaminationTest,
  SubjectToTest,
  MarksEntry,
  MarksHistoryEntry,
  Sketch,
  SketchAttribute,
  SketchTemplate,
  SketchReportConfiguration,
  ReportTemplateGlobal,
  StudentTemplateAssignment,
  AssignedSubjectToClass,
  SubjectToClassCurriculum,
  SubjectSkillMapping,
} from "@/types/academics";

// Every store persists to localStorage under its own "academics.<name>" key (see
// createListStore.ts) — same data shapes as prisma/schema.prisma additions in
// ACADEMIC_DATABASE_SCHEMA.md, so swapping this for real API/DB calls later only
// means changing this file, not the ~45 pages/components that call these stores.

export const departmentStore = createListStore<Department>("academics.departments", initialDepartments);
export const subjectTypeStore = createListStore<SubjectType>("academics.subjectTypes", initialSubjectTypes);
export const skillStore = createListStore<Skill>("academics.skills", initialSkills);
export const subjectSkillMappingStore = createListStore<SubjectSkillMapping>("academics.subjectSkillMappings", initialSubjectSkillMappings);
export const remarkStore = createListStore<Remark>("academics.remarks", initialRemarks);
export const gradeSystemStore = createListStore<GradeSystem>("academics.gradeSystems", initialGradeSystems);
export const gradeBandStore = createListStore<GradeSystemConfiguration>("academics.gradeBands", initialGradeBands);
export const electiveGroupStore = createListStore<ElectiveGroup>("academics.electiveGroups", initialElectiveGroups);
export const examRoomStore = createListStore<ExamRoom>("academics.examRooms", initialExamRooms);
export const testMasterStore = createListStore<TestMaster>("academics.testMasters", initialTestMasters);
export const testStore = createListStore<ExaminationTest>("academics.tests", initialTests);
// Bumped to .v2 — the seed now marks a Mathematics+English config as AAT-enabled on every
// Test, not just one. Without a new key, anyone who already loaded this app keeps the old,
// mostly-non-AAT seed cached in localStorage and AAT Entry stays empty for almost every selection.
export const subjectToTestStore = createListStore<SubjectToTest>("academics.subjectToTest.v2", initialSubjectToTest);
export const marksStore = createListStore<MarksEntry>("academics.marks", initialMarks);
export const marksHistoryStore = createListStore<MarksHistoryEntry>("academics.marksHistory", initialMarksHistory);
export const sketchStore = createListStore<Sketch>("academics.sketches.v3", initialSketches);
export const sketchAttributeStore = createListStore<SketchAttribute>("academics.sketchAttributes", initialSketchAttributes);
export const sketchTemplateStore = createListStore<SketchTemplate>("academics.sketchTemplates", initialSketchTemplates);
export const sketchReportConfigStore = createListStore<SketchReportConfiguration>("academics.sketchReportConfigs", initialSketchReportConfigs);
export const globalTemplateStore = createListStore<ReportTemplateGlobal>("academics.globalTemplates", initialGlobalTemplates);
export const studentTemplateAssignStore = createListStore<StudentTemplateAssignment>("academics.studentTemplateAssignments", initialStudentTemplateAssignments);
export const assignedSubjectStore = createListStore<AssignedSubjectToClass>("academics.assignedSubjects", []);
export const curriculumStore = createListStore<SubjectToClassCurriculum>("academics.curriculum", []);
