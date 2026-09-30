# Academic Module — Database Schema (Prisma)

**Source:** Extracted from `ACADEMIC_NEXTJS_IMPLEMENTATION_PLAN.md` Section 4 (Phase A1).
**Target:** Add these models to the existing `prisma/schema.prisma`. This module shares `PupilsightSchoolYear`, `PupilsightProgram`, `PupilsightYearGroup`, `PupilsightRollGroup`, `PupilsightProgramClassSectionMapping`, `PupilsightStudentEnrolment` already modeled for the Admission module — **do not redefine these**, only reference their IDs.
**Status note:** This plan text was pasted mid-document and cut off after Section 12.1 (Electives). The models below cover Subjects/Curriculum, Skills/Remarks, Grade System, Electives, Test Management, and Marks/History in full. Sketches/Report Cards and Analysis/Export reports (Sections 13–14 of the source plan) reference additional model names (`ExaminationReportTemplateSketch`, etc.) that **are** included below because they appeared in the schema block itself, even though the narrative sections describing their screens were not yet pasted — treat the narrative context for those tables as incomplete until that part of the plan is supplied.

---

## 1. Design Notes (read before migrating)

- **`attributeType` / `tableLabel` are intentionally `String`, not `enum`.** The real value set for the "Attribute Type" dropdown is DB-seeded in the legacy system via `SELECT table_label FROM examinationReportTemplateConfiguration GROUP BY table_label` — the actual label strings do not exist in this plan or in any seed file yet. **Do not hardcode a TS enum for these fields until a live data dump confirms the values.**
- **`ExaminationReportTemplate` vs `ExaminationReportTemplateGlobalMaster`** were the same table name in the legacy source (`examinationReportTemplateMaster` reused for two different concepts: a per-sketch template and a module-wide PDF-only master list). They are split into two distinct models here for clarity — **confirm actual production table names against a live schema dump before running any real data migration**, since the split is an inference, not a confirmed 1:1 mapping.
- **Three-tier marks lock.** `ExaminationMarksEntryBySubject.status`, `ExaminationTest.lockMarksEntry`, and `ExaminationTestStudentConfig.lockMarksEntry` together implement a three-tier lock (test-level lock → per-student override → per-entry finalized flag). Model all three fields — do not collapse them into one boolean, the UI's `<MarksGrid>` component depends on being able to distinguish "locked because the test is locked" from "locked because this specific student's entry was finalized."
- **Tenant-specific business logic must not leak into the schema as tenant checks.** Anywhere the legacy PHP branched on a school's domain name or a hardcoded role ID, that must become a real setting row (e.g. a `SchoolFeatureFlag` / `ReportColumnConfig` table) rather than an `if (tenant === 'x')` in application code. No such flag table is defined yet in this plan — add one before Phase A2 (Subjects) work starts, since `showReadWriteMemoryFields`-style toggles are referenced by the frontend plan (see `ACADEMIC_FRONTEND_PLAN.md` Section 4).

---

## 2. Full Prisma Schema Block

```prisma
// ── SUBJECTS / DEPARTMENTS ──────────────────────────

model Department {
  id            Int      @id @default(autoincrement())
  name          String
  nameShort     String?
  type          String   // 'Learning Area' | 'Administration' | 'Scholastic' | 'Co-Scholastic' | 'Part A' | 'Part B'
  subjectCode   String?
  readMin       Int?     // school-specific (GNS) extension fields
  readMedium    Int?
  readMax       Int?
  writeMin      Int?
  writeMedium   Int?
  writeMax      Int?
  memoryMin     Int?
  memoryMedium  Int?
  memoryMax     Int?
  sections      DepartmentSectionWise[]
  curriculum    SubjectToClassCurriculum[]
  coreAssign    AssignCoreSubjectToClass[]
  secondLang    AssignSecondLanguageToClass[]
  thirdLang     AssignThirdLanguageToClass[]
  @@map("pupilsightDepartment")
}

model DepartmentType {
  id   Int    @id @default(autoincrement())
  name String @unique
  @@map("pupilsightDepartmentType")
}

model DepartmentSectionWise {
  id           Int        @id @default(autoincrement())
  departmentId Int
  sectionId    Int
  department   Department @relation(fields: [departmentId], references: [id])
  @@map("pupilsightDepartmentSectionWise")
}

model AssignCoreSubjectToClass {
  id           Int        @id @default(autoincrement())
  departmentId Int
  yearGroupId  Int
  programId    Int
  position     Int        @default(0)
  department   Department @relation(fields: [departmentId], references: [id])
  @@map("assign_core_subjects_toclass")
}

model AssignSecondLanguageToClass {
  id           Int        @id @default(autoincrement())
  departmentId Int
  yearGroupId  Int
  programId    Int
  department   Department @relation(fields: [departmentId], references: [id])
  @@map("assign_second_language_toclass")
}

model AssignThirdLanguageToClass {
  id           Int        @id @default(autoincrement())
  departmentId Int
  yearGroupId  Int
  programId    Int
  department   Department @relation(fields: [departmentId], references: [id])
  @@map("assign_third_language_toclass")
}

model SubjectToClassCurriculum {
  id                 Int        @id @default(autoincrement())
  departmentId       Int
  yearGroupId        Int
  programId          Int
  subjectCode        String?
  subjectDisplayName String?
  subjectType        String     // Core | Elective
  diMode             String     // FREE_FORM | SUBJECT_WISE | SUBJECT_WISE_NO_EDIT | SUBJECT_GRADE_WISE | SUBJECT_GRADE_WISE_AUTO | NO_DI
  position           Int        @default(0)
  department         Department @relation(fields: [departmentId], references: [id])
  @@map("subjectToClassCurriculum")
}

model SubjectType {
  id   Int    @id @default(autoincrement())
  name String @unique
  @@map("subject_type") // lookup table backing subject_type_manage.php
}

model SubjectSkillMapping {
  id           Int @id @default(autoincrement())
  departmentId Int
  skillId      Int
  @@map("subjectSkillMapping")
}

// ── SKILLS & REMARKS ─────────────────────────────────

model Skill {
  id          Int      @id @default(autoincrement())
  name        String
  code        String   @unique
  description String?  @db.Text
  @@map("ac_manage_skill")
}

model Remark {
  id           Int      @id @default(autoincrement())
  remarkCode   String
  description  String   @db.Text
  departmentId Int?
  skillId      Int?
  @@map("acRemarks")
}

// ── GRADE SYSTEM ──────────────────────────────────────

model GradeSystem {
  id                Int      @id @default(autoincrement())
  name              String
  code              String
  passFailCondition String?  // 'Marks' | 'Grade'
  configurations    GradeSystemConfiguration[]
  @@map("examinationGradeSystem")
}

model GradeSystemConfiguration {
  id             Int         @id @default(autoincrement())
  gradeSystemId  Int
  gradeName      String
  gradePoint     Decimal     @db.Decimal(6, 2)
  lowerLimit     Decimal     @db.Decimal(6, 2)
  upperLimit     Decimal     @db.Decimal(6, 2)
  rank           Int?
  subjectStatus  String      // Pass | Fail
  classObtained  String?     // Distinction | First Class | Second Class | Poor
  description    String?     @db.Text
  imagePath      String?
  gradeUniqueNo  String?
  gradeSystem    GradeSystem @relation(fields: [gradeSystemId], references: [id])
  @@map("examinationGradeSystemConfiguration")
}

// ── ELECTIVES ─────────────────────────────────────────

model ElectiveGroup {
  id             Int      @id @default(autoincrement())
  name           String
  orderNo        Int
  minSelection   Int
  maxSelection   Int
  academicYearId Int
  programId      Int
  yearGroupId    Int
  sections       ElectiveGroupSection[]
  subjects       ElectiveGroupSubject[]
  @@map("ac_elective_group")
}

model ElectiveGroupSection {
  id              Int           @id @default(autoincrement())
  electiveGroupId Int
  sectionId       Int
  electiveGroup   ElectiveGroup @relation(fields: [electiveGroupId], references: [id])
  @@map("ac_elective_group_section")
}

model ElectiveGroupSubject {
  id              Int           @id @default(autoincrement())
  electiveGroupId Int
  departmentId    Int
  electiveGroup   ElectiveGroup @relation(fields: [electiveGroupId], references: [id])
  @@map("ac_elective_group_subjects")
}

// ── TEST MANAGEMENT ───────────────────────────────────

model ExaminationTestMaster {
  id             Int              @id @default(autoincrement())
  name           String
  code           String
  academicYearId Int
  tests          ExaminationTest[]
  @@map("examinationTestMaster")
}

model ExaminationTest {
  id                   Int      @id @default(autoincrement())
  testMasterId         Int?
  name                 String
  gradeSystemId        Int?
  reportTemplateId     Int?
  termId               Int?
  assessmentMethod     String?  // Marks | Grade
  assessmentOption     String?  // Radio Button | Dropdown
  maxMarks             Decimal? @db.Decimal(6, 2)
  minMarks             Decimal? @db.Decimal(6, 2)
  enableRemarks        Boolean  @default(false)
  enableSchedule       Boolean  @default(false)
  startDate            DateTime? @db.Date
  endDate              DateTime? @db.Date
  startTime            String?
  endTime              String?
  topic                String?
  isShow               Boolean  @default(true)
  enableHtml           Boolean  @default(false)
  enablePdf            Boolean  @default(false)
  enablePublish        Boolean  @default(false)
  enableTestReport     Boolean  @default(false)
  lockMarksEntry       Boolean  @default(false)
  assignments          ExaminationTestAssignClass[]
  subjectConfig        ExaminationSubjectToTest[]
  subjectCategories     ExaminationTestSubjectCategory[]
  studentConfigs       ExaminationTestStudentConfig[]
  @@map("examinationTest")
}

model ExaminationTestAssignClass {
  id           Int             @id @default(autoincrement())
  testId       Int
  programId    Int
  yearGroupId  Int
  rollGroupId  Int?
  schoolYearId Int
  test         ExaminationTest @relation(fields: [testId], references: [id])
  @@map("examinationTestAssignClass")
}

model ExaminationSubjectToTest {
  id                Int             @id @default(autoincrement())
  testId            Int
  departmentId      Int
  isTested          Boolean         @default(true)
  assessmentMethod  String?
  assessmentOption  String?
  maxMarks          Decimal?        @db.Decimal(6, 2)
  minMarks          Decimal?        @db.Decimal(6, 2)
  enableRemarks     Boolean         @default(false)
  gradeSystemId     Int?
  examDate          DateTime?       @db.Date
  examStartTime     String?
  examEndTime       String?
  roomId            Int?
  invigilatorId     Int?
  aat               Boolean         @default(false)
  aatCalculationBy  String?         // Sum | Average
  test              ExaminationTest @relation(fields: [testId], references: [id])
  skillConfig       ExaminationSubjectToTestSkillConfigure[]
  @@map("examinationSubjectToTest")
}

model ExaminationSubjectToTestSkillConfigure {
  id             Int                      @id @default(autoincrement())
  subjectToTestId Int
  skillId        Int
  weightageType  String                   // None | Sum | Average | Percentage
  weightage      Decimal?                 @db.Decimal(6, 2)
  subjectToTest  ExaminationSubjectToTest @relation(fields: [subjectToTestId], references: [id])
  @@map("examinationSubjectToTestSkillConfigure")
}

model ExaminationTestSubjectCategory {
  id               Int             @id @default(autoincrement())
  testId           Int
  categoryName     String
  assessmentMethod String?
  assessmentOption String?
  maxMarks         Decimal?        @db.Decimal(6, 2)
  minMarks         Decimal?        @db.Decimal(6, 2)
  gradeSystemId    Int?
  test             ExaminationTest @relation(fields: [testId], references: [id])
  @@map("examinationTestSubjectCategory")
}

model ExaminationTestStudentConfig {
  id                 Int             @id @default(autoincrement())
  testId             Int
  pupilsightPersonId Int
  lockMarksEntry     Int             @default(0) // 0=unset 1=locked at test level 2=locked for this student
  enablePdf          Boolean?
  enableHtml         Boolean?
  enableTestReport   Int?
  test               ExaminationTest @relation(fields: [testId], references: [id])
  @@map("examinationTestStudentConfig")
}

model ExaminationRoomMaster {
  id   Int    @id @default(autoincrement())
  name String @unique
  code String @unique
  @@map("examinationRoomMaster")
}

// ── MARKS & HISTORY ───────────────────────────────────

model ExaminationMarksEntryBySubject {
  id                    Int      @id @default(autoincrement())
  testId                Int
  pupilsightPersonID    Int
  departmentId          Int
  skillId               Int?
  marksObtained         Decimal? @db.Decimal(6, 2)
  gradeId               Int?
  abex                  String?  // AB | EX | EX(S) | EX(C)
  remarkType             String?  // fromlist | enter_own
  remark                String?  @db.Text
  status                Int      @default(0) // 1 = locked/finalized
  entryType             Int      @default(1)
  pupilsightPersonIDTaker Int?
  updatedAt             DateTime @updatedAt
  @@map("examinationMarksEntrybySubject")
}

model HistoryOfStudentsMarks {
  id                      Int      @id @default(autoincrement())
  testId                  Int
  pupilsightPersonID      Int
  departmentId            Int
  skillId                 Int?
  marksObtained           Decimal? @db.Decimal(6, 2)
  gradeId                 Int?
  remark                  String?  @db.Text
  pupilsightPersonIDTaker Int?
  createdAt               DateTime @default(now())
  @@map("history_of_students_marks")
}

// ── REPORT CARDS / SKETCHES ───────────────────────────

model ExaminationReportTemplateSketch {
  id             Int      @id @default(autoincrement())
  sketchName     String
  sketchCode     String
  programId      String   // legacy CSV column, superseded by progClass below where present
  schoolYearId   Int
  classIds       String?  // legacy CSV column
  templateFilename String?
  progClass      ExaminationReportTemplateSketchProgClass[]
  attributes     ExaminationReportTemplateAttribute[]
  reportTemplates ExaminationReportTemplate[]
  reportConfigs  ExaminationSketchReportConfiguration[]
  @@map("examinationReportTemplateSketch")
}

model ExaminationReportTemplateSketchProgClass {
  id          Int                             @id @default(autoincrement())
  sketchId    Int
  programId   Int
  yearGroupId Int
  sketch      ExaminationReportTemplateSketch @relation(fields: [sketchId], references: [id])
  @@map("examinationReportTemplateSketch_prog_class")
}

model ExaminationReportTemplateAttribute {
  id               Int                             @id @default(autoincrement())
  sketchId         Int
  attributeName    String
  attributeCategory String                         // Entity|Test|Computed|Attendance|Wired|Aggregate|Graph|External|Strength
  attributeType    String                           // DB-seeded label from examinationReportTemplateConfiguration.table_label — see Section 1 notes
  position         Int                              @default(0)
  gradeSystemId    Int?
  finalFormula     String?
  finalFormulaBestCalc String?
  canUseForRank    Boolean                          @default(false)
  sketch           ExaminationReportTemplateSketch  @relation(fields: [sketchId], references: [id])
  formulaMappings  ExaminationReportTemplateFormulaAttributeMapping[]
  graphDetails     ExaminationReportTemplateGraphAttributeDetail[]
  @@map("examinationReportTemplateAttributes")
}

model ExaminationReportTemplateConfiguration {
  id         Int    @id @default(autoincrement())
  tableLabel String // seeds the Attribute Type dropdown — values must be pulled from live DB, see Section 1 notes
  @@map("examinationReportTemplateConfiguration")
}

model ExaminationReportTemplateFormula {
  id         Int    @id @default(autoincrement())
  formulaName String
  expression String @db.Text
  @@map("examinationReportTemplateFormula")
}

model ExaminationReportTemplateFormulaAttributeMapping {
  id          Int                                 @id @default(autoincrement())
  attributeId Int
  formulaId   Int?
  formulaVal  String?
  attribute   ExaminationReportTemplateAttribute  @relation(fields: [attributeId], references: [id])
  @@map("examinationReportTemplateFormulaAttributeMapping")
}

model ExaminationReportTemplatePlugin {
  id         Int    @id @default(autoincrement())
  pluginName String
  pluginType String? // drives special-cased value inputs (date-format / case-transform)
  @@map("examinationReportTemplatePlugin")
}

model ExaminationReportTemplateGraphAttributeDetail {
  id          Int                                @id @default(autoincrement())
  attributeId Int
  graphTitle  String?
  yAxisTitle  String?
  xAxisTitle  String?
  legend      String?
  boundary    String?
  colorHex    String?
  attribute   ExaminationReportTemplateAttribute @relation(fields: [attributeId], references: [id])
  @@map("examinationReportTemplateGraphAttributeDetails")
}

model ExaminationReportTemplate {
  id              Int                             @id @default(autoincrement())
  sketchId        Int
  name            String
  yearGroupIds    String
  filePath        String
  filename        String
  sketch          ExaminationReportTemplateSketch @relation(fields: [sketchId], references: [id])
  imageConfig     ExaminationReportSketchConfigureImage[]
  @@map("examinationReportTemplateMaster") // per-sketch template — distinct from the global one below
}

model ExaminationReportSketchConfigureImage {
  id         Int                       @id @default(autoincrement())
  templateId Int
  x          Int
  y          Int
  pageNo     Int
  width      Int
  height     Int
  imageType  String                    // image | grade_image
  template   ExaminationReportTemplate @relation(fields: [templateId], references: [id])
  @@map("examinationReportSketchConfigureImage")
}

model ExaminationReportTemplateGlobalMaster {
  id       Int    @id @default(autoincrement())
  name     String @unique
  filePath String
  filename String
  @@map("examinationReportTemplateMasterGlobal") // renamed to avoid clash — global "Report Template" master list, PDF-only uploads
}

model ExaminationSketchReportConfiguration {
  id          Int                             @id @default(autoincrement())
  sketchId    Int
  name        String
  code        String?
  description String?                         @db.Text
  sketch      ExaminationReportTemplateSketch @relation(fields: [sketchId], references: [id])
  attributeConfig ExaminationSketchReportAttributeConfiguration[]
  @@map("examinationSketchReportConfiguration")
}

model ExaminationSketchReportAttributeConfiguration {
  id            Int                                  @id @default(autoincrement())
  reportConfigId Int
  attributeName String
  attributeLabel String?
  groupHeader   String?
  isSort        Boolean                              @default(false)
  position      Int                                  @default(0)
  reportConfig  ExaminationSketchReportConfiguration @relation(fields: [reportConfigId], references: [id])
  @@map("examinationSketchReportAttributeConfiguration")
}

model ExaminationReportTemplateSketchData {
  id                 Int      @id @default(autoincrement())
  sketchGenerateId   Int
  pupilsightPersonID Int
  masterAttributeName String
  attributeNameWord  String?
  attributeValue     String?  @db.Text
  attributeType      String?  // includes 'grade_image' for grade-image config lookups
  @@map("examinationReportTemplateSketchData")
}

model ExaminationReportTemplateSketchGenerate {
  id           Int      @id @default(autoincrement())
  sketchId     Int
  programId    Int
  yearGroupId  Int
  rollGroupId  Int
  generatedBy  Int
  generatedAt  DateTime @default(now())
  @@map("examinationReportTemplateSketchGenerate")
}

model ExaminationReportSketchTemplateMaster {
  id   Int    @id @default(autoincrement())
  name String
  @@map("examinationReportSketchTemplateMaster") // per-student template override list (student_template_assign.php)
}

model StudentTemplateAssign {
  id                 Int @id @default(autoincrement())
  pupilsightPersonID Int
  testId             Int
  templateId         Int
  @@map("student_template_assign")
}
```

---

## 3. Table Reference Index (grouped by functional area)

| Functional area | Models |
|---|---|
| **Subjects / Departments** | `Department`, `DepartmentType`, `DepartmentSectionWise`, `SubjectType`, `SubjectSkillMapping` |
| **Curriculum / class assignment** | `SubjectToClassCurriculum`, `AssignCoreSubjectToClass`, `AssignSecondLanguageToClass`, `AssignThirdLanguageToClass` |
| **Skills & Remarks** | `Skill`, `Remark` |
| **Grade System** | `GradeSystem`, `GradeSystemConfiguration` |
| **Electives** | `ElectiveGroup`, `ElectiveGroupSection`, `ElectiveGroupSubject` |
| **Exam Rooms** | `ExaminationRoomMaster` |
| **Test Management** | `ExaminationTestMaster`, `ExaminationTest`, `ExaminationTestAssignClass`, `ExaminationSubjectToTest`, `ExaminationSubjectToTestSkillConfigure`, `ExaminationTestSubjectCategory`, `ExaminationTestStudentConfig` |
| **Marks Entry & History** | `ExaminationMarksEntryBySubject`, `HistoryOfStudentsMarks` |
| **Report Cards / Sketches** | `ExaminationReportTemplateSketch`, `ExaminationReportTemplateSketchProgClass`, `ExaminationReportTemplateAttribute`, `ExaminationReportTemplateConfiguration`, `ExaminationReportTemplateFormula`, `ExaminationReportTemplateFormulaAttributeMapping`, `ExaminationReportTemplatePlugin`, `ExaminationReportTemplateGraphAttributeDetail`, `ExaminationReportTemplate`, `ExaminationReportSketchConfigureImage`, `ExaminationReportTemplateGlobalMaster`, `ExaminationSketchReportConfiguration`, `ExaminationSketchReportAttributeConfiguration`, `ExaminationReportTemplateSketchData`, `ExaminationReportTemplateSketchGenerate`, `ExaminationReportSketchTemplateMaster`, `StudentTemplateAssign` |

---

## 4. Open Items Before Migration

1. **Enumerate `attributeType`/`tableLabel` real values** from a live `examinationReportTemplateConfiguration` dump (or install/seed SQL) — cannot be finalized as a TS enum yet.
2. **Confirm `examinationReportTemplateMaster` table split** (per-sketch template vs. global master) against a live schema dump before running real data migration.
3. **Add a tenant-configuration table** (e.g. `SchoolFeatureFlag` or `ReportColumnConfig`) to replace hardcoded per-school branches found in the legacy source (e.g. `showReadWriteMemoryFields` on `Department`, Sacred-Heart/BGSPSK-specific computed-column logic in Sketches). Not yet modeled — needed before Phase A2/A8 build-out.
4. Grade-recompute batch logic (legacy `update_grade*.php` scripts) has no confirmed live caller — decide whether a trigger/server-action replacement is needed before relying on `GradeSystemConfiguration` changes alone to keep marks/grades consistent.
