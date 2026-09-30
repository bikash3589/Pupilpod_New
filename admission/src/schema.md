# Admission Module — Prisma Schema

Generated from `prisma/schema.prisma`, reverse-engineered from `pupilpod_table_structure.sql` and the PHP admission/campaign pipeline (`modules/Campaign/*`, `src/Domain/Admission/*`).

```prisma
// =============================================================================
// Pupilsight (Gibbon-based) — ADMISSION MODULE — Prisma schema
// =============================================================================
//
// Source of truth: pupilpod_table_structure.sql (raw MySQL dump at repo root).
// This codebase is plain PHP (no ORM/migrations) — every table below was
// reverse-engineered directly from that SQL dump, not from any framework
// convention. The "Admission" feature is implemented as the "Campaign"
// module (`modules/Campaign/*`, PHP namespace `Pupilsight\Domain\Admission`),
// backed by an embedded WordPress FluentForm plugin for the actual
// application/enquiry form + submissions, plus a legacy/superseded native
// Gibbon "ApplicationForm" table set that is still referenced from
// `pupilsightPerson` and therefore kept here for completeness.
//
// SCOPE
// -----
// Included:
//   - Campaign / seat-matrix / workflow (admission pipeline & state machine)
//   - FluentForm-backed application/enquiry submissions
//   - Legacy native pupilsightApplicationForm* tables
//   - The Finance (fn_fee_*) chain that Admission directly depends on
//     (fee structure -> fee items -> invoice -> applicant collection)
//   - Minimal stub models for core entities Admission tables point at
//     (Person, SchoolYear, Program, YearGroup, RollGroup, Family, Payment,
//     Role, StudentEnrolment, FeeCategory) — these belong to other modules
//     (SIS/HR/Finance) and are modeled only as far as needed for correct
//     relations, not exhaustively.
//   - Module / ModuleButton / ModuleButtonPermission — the generic core
//     "Button Permission" mechanism (modules/Campaign/button_permission.php),
//     keyed by pupilsightModuleID (178 = Campaign/Admission in this install).
//     This is shared across every module, not Admission-specific, but is
//     included because it is exactly the pipeline screen requested: it
//     controls which staff can see/click each named admission action button,
//     separate from `WorkflowTransition.userPermission` which instead gates
//     execution of one specific pipeline state-transition.
// Deliberately excluded (out of Admission's scope):
//   - `campaign_form_1..7` — ephemeral MyISAM cache tables that
//     `CampaignGateway::createMySQlTable()` drops/recreates on every list
//     view; the real data lives in `wp_fluentform_submissions` /
//     `wp_fluentform_entry_details`, modeled below instead.
//   - Generic FluentForm plugin plumbing (`wp_fluentform_logs`,
//     `..._form_analytics`, `..._subscriptions`, `..._transactions`,
//     `..._order_items`, `..._submission_meta`, `wp_ff_scheduled_actions`).
//   - Peripheral Finance tables not directly touched by admission flows
//     (discounts, fines, counters, deposits, refunds, waive-offs, transport
//     fee items, payment gateways/online settings) — these belong to the
//     separate Finance module.
//
// MODELING NOTES
// ---------------
// 1. This legacy MySQL schema has NO enforced FOREIGN KEY constraints
//    anywhere (relations are only ever resolved in PHP application code).
//    The `@relation`s below are added deliberately to make this schema
//    useful as a real relational schema; they are not literal 1:1
//    introspection output.
// 2. Several FK-like columns are declared with a narrower integer width
//    (e.g. `int(11)`) than the primary key they logically reference (e.g.
//    `bigint(20)`) — this "works" in production only because row counts
//    stay under 2^31. To keep relations valid, every relation's scalar
//    field is widened to match its target's `@id` type; the original
//    column width is preserved as a comment where it differs.
// 3. Column names are preserved via `@map`/`@@map` so this schema stays
//    traceable to `pupilsightPerson`-style camelCase and `fn_fee_*`-style
//    snake_case tables as they actually exist in the live databases (each
//    school tenant = one physical MySQL database with this same schema).
// 4. MySQL `tinyint` columns that only ever hold a true/false flag are
//    modeled as `Boolean`; `tinyint`/`int` columns whose comment documents
//    3+ numeric meanings (status codes) are kept as `Int` with that
//    meaning transcribed in a comment, since Prisma enums would not match
//    the integers actually stored.
// =============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// -----------------------------------------------------------------------------
// Shared enums
// -----------------------------------------------------------------------------

enum YesNo {
  N
  Y
}

// -----------------------------------------------------------------------------
// Core reference stubs (owned by other modules — SIS / HR / Finance)
// -----------------------------------------------------------------------------

enum SchoolYearStatus {
  Past
  Current
  Upcoming
}

/// pupilsightSchoolYear — academic year master, referenced throughout Admission.
model SchoolYear {
  id             Int              @id @default(autoincrement()) @map("pupilsightSchoolYearID")
  name           String           @unique(map: "academicYearName") @db.VarChar(256)
  status         SchoolYearStatus @default(Upcoming)
  sequenceNumber Int              @unique
  firstDay       DateTime?        @db.Date
  lastDay        DateTime?        @db.Date

  campaigns              Campaign[]
  applicationFormEntries ApplicationForm[]
  feeAdmissionSettings   FeeAdmissionSetting[]
  feeSeries              FeeSeries[]
  feeItems               FeeItem[]
  feeStructures          FeeStructure[]
  feeInvoices            FeeInvoice[]
  feesHeads              FeesHead[]
  feesCollections        FeesCollection[]
  studentEnrolments      StudentEnrolment[]
  yearGroups             YearGroup[]
  rollGroups             RollGroup[]
  programClassMappings   ProgramClassSectionMapping[]
  personsClassOf         Person[]                     @relation("PersonClassOf")

  @@map("pupilsightSchoolYear")
}

/// pupilsightSchoolFinanceYear — separate finance-period calendar, same shape as SchoolYear.
model SchoolFinanceYear {
  id             Int              @id @default(autoincrement()) @map("pupilsightSchoolFinanceYearID")
  name           String           @unique(map: "academicYearName") @db.VarChar(36)
  status         SchoolYearStatus @default(Upcoming)
  sequenceNumber Int              @unique
  firstDay       DateTime?        @db.Date
  lastDay        DateTime?        @db.Date

  feeStructures FeeStructure[]
  feeInvoices   FeeInvoice[]

  @@map("pupilsightSchoolFinanceYear")
}

/// pupilsightProgram — e.g. "Primary", "Secondary".
model Program {
  id             Int    @id @default(autoincrement()) @map("pupilsightProgramID")
  name           String @db.VarChar(255)
  nameShort      String @db.VarChar(4)
  sequenceNumber Int

  campaignProgClasses    CampaignProgClass[]
  seatMatrices           SeatMatrix[]
  fluentFormSubmissions  FluentFormSubmission[]
  feeSeries              FeeSeries[]
  feeInvoiceClassAssigns FeeInvoiceClassAssign[]
  programClassMappings   ProgramClassSectionMapping[]
  studentEnrolments      StudentEnrolment[]

  @@unique([name, nameShort, sequenceNumber])
  @@map("pupilsightProgram")
}

/// pupilsightYearGroup — "Class" / grade level.
model YearGroup {
  id             Int         @id @default(autoincrement()) @map("pupilsightYearGroupID")
  schoolYearId   Int?        @map("pupilsightSchoolYearID")
  schoolYear     SchoolYear? @relation(fields: [schoolYearId], references: [id])
  name           String      @db.VarChar(255)
  nameShort      String      @db.VarChar(255)
  sequenceNumber Int
  headOfYearId   Int?        @map("pupilsightPersonIDHOY")

  campaignProgClasses    CampaignProgClass[]
  seatMatrices           SeatMatrix[]
  fluentFormSubmissions  FluentFormSubmission[]
  feeInvoiceClassAssigns FeeInvoiceClassAssign[]
  programClassMappings   ProgramClassSectionMapping[]
  studentEnrolments      StudentEnrolment[]
  applicationForms       ApplicationForm[]

  @@map("pupilsightYearGroup")
}

/// pupilsightRollGroup — "Section" within a class.
model RollGroup {
  id              Int        @id @default(autoincrement()) @map("pupilsightRollGroupID")
  schoolYearId    Int        @map("pupilsightSchoolYearID")
  schoolYear      SchoolYear @relation(fields: [schoolYearId], references: [id])
  name            String     @db.VarChar(255)
  nameShort       String     @db.VarChar(255)
  nextRollGroupId Int?       @map("pupilsightRollGroupIDNext")
  attendance      YesNo      @default(Y)
  website         String     @db.VarChar(255)

  feeInvoiceClassAssigns FeeInvoiceClassAssign[]
  programClassMappings   ProgramClassSectionMapping[]
  studentEnrolments      StudentEnrolment[]
  applicationForms       ApplicationForm[]

  @@map("pupilsightRollGroup")
}

/// pupilsightProgramClassSectionMapping — valid Program+Class+Section combinations.
model ProgramClassSectionMapping {
  id           Int         @id @default(autoincrement()) @map("pupilsightMappingID")
  schoolYearId Int?        @map("pupilsightSchoolYearID")
  schoolYear   SchoolYear? @relation(fields: [schoolYearId], references: [id])
  programId    Int         @map("pupilsightProgramID")
  program      Program     @relation(fields: [programId], references: [id])
  yearGroupId  Int         @map("pupilsightYearGroupID")
  yearGroup    YearGroup   @relation(fields: [yearGroupId], references: [id])
  rollGroupId  Int         @map("pupilsightRollGroupID")
  rollGroup    RollGroup   @relation(fields: [rollGroupId], references: [id])

  studentEnrolments StudentEnrolment[]

  @@map("pupilsightProgramClassSectionMapping")
}

enum RoleCategory {
  Staff
  Student
  Parent
  Other
}

enum RoleType {
  Core
  Additional
}

enum RoleRestriction {
  None
  SameRole  @map("Same Role")
  AdminOnly @map("Admin Only")
}

/// pupilsightRole — Student/Parent/Staff role catalogue; Person.roleIdPrimary points here.
model Role {
  id               Int             @id @default(autoincrement()) @map("pupilsightRoleID")
  category         RoleCategory    @default(Staff)
  name             String          @unique @db.VarChar(20)
  nameShort        String          @unique @db.VarChar(4)
  description      String          @db.VarChar(60)
  type             RoleType        @default(Core)
  canLoginRole     YesNo           @default(Y)
  futureYearsLogin YesNo           @default(Y)
  pastYearsLogin   YesNo           @default(Y)
  restriction      RoleRestriction @default(None)

  persons Person[]

  @@map("pupilsightRole")
}

enum PersonStatus {
  Full
  Expected
  Left
  PendingApproval @map("Pending Approval")
}

/// pupilsightPerson — partial model. The real table has ~175 columns spanning
/// SIS/HR/transport/etc; only fields Admission actually reads or writes are
/// modeled here (identity, linkage back to ApplicationForm/FluentForm, and
/// the ad-hoc parent/admission columns bolted onto this table over time).
model Person {
  id                  Int              @id @default(autoincrement()) @map("pupilsightPersonID")
  submissionId        Int?             @map("submission_id")
  title               String?          @db.VarChar(20)
  surname             String?          @default("") @db.VarChar(255)
  firstName           String?          @default("") @db.VarChar(255)
  preferredName       String           @default("") @db.VarChar(255)
  officialName        String           @db.VarChar(255)
  gender              String?          @db.VarChar(255)
  username            String?          @unique @db.VarChar(255)
  status              PersonStatus?    @default(Full)
  canLogin            YesNo?           @default(Y)
  roleIdPrimary       Int?             @map("pupilsightRoleIDPrimary")
  role                Role?            @relation(fields: [roleIdPrimary], references: [id])
  roleIdAllCsv        String?          @map("pupilsightRoleIDAll") @db.VarChar(255)
  dob                 DateTime?        @db.Date
  email               String?          @db.VarChar(255)
  emailAlternate      String?          @db.VarChar(255)
  houseId             Int?             @map("pupilsightHouseID")
  studentIdCode       String?          @map("studentID") @db.VarChar(10)
  dateStart           DateTime?        @db.Date
  dateEnd             DateTime?        @db.Date
  schoolYearIdClassOf Int?             @map("pupilsightSchoolYearIDClassOf")
  schoolYearClassOf   SchoolYear?      @relation("PersonClassOf", fields: [schoolYearIdClassOf], references: [id])
  applicationFormId   Int?             @map("pupilsightApplicationFormID")
  applicationForm     ApplicationForm? @relation(fields: [applicationFormId], references: [id])
  active              Int?             @default(1)
  isDelete            Boolean          @default(false) @map("is_delete")
  createdAt           DateTime         @default(now()) @map("created_at")
  feeCategoryId       Int?             @map("fee_category_id")
  feeCategory         FeeCategory?     @relation(fields: [feeCategoryId], references: [id])
  admissionNo         String?          @map("admission_no") @db.Text
  rollNo              String?          @map("roll_no") @db.Text
  fatherName          String?          @map("father_name") @db.Text
  fatherMobile        String?          @map("father_mobile") @db.VarChar(12)
  fatherEmail         String?          @map("father_email") @db.Text
  motherName          String?          @map("mother_name") @db.Text
  motherMobile        String?          @map("mother_mobile") @db.Text
  motherEmail         String?          @map("mother_email") @db.Text
  guardianName        String?          @map("guardian_name") @db.Text
  guardianMobile      String?          @map("guard_mob") @db.Text

  // --- back-relations from Admission tables ---
  campaignCreated                     Campaign[]                    @relation("CampaignCreator")
  campaignFormStatuses                CampaignFormStatus[]
  campaignParentRegistrations         CampaignParentRegistration[]
  campaignEmailSmsSentDetails         CampaignEmailSmsSentDetail[]
  campaignTransitionsFormMaps         CampaignTransitionsFormMap[]
  seatMatricesCreated                 SeatMatrix[]
  workflowsCreated                    Workflow[]
  workflowMapsCreated                 WorkflowMap[]
  workflowStatesCreated               WorkflowState[]
  workflowTransitionsCreated          WorkflowTransition[]
  fluentFormSubmissions               FluentFormSubmission[]
  feeInvoiceApplicantAssignsCancelled FeeInvoiceApplicantAssign[]
  feePaymentDetails                   FeePaymentDetail[]
  feesCollectionsTaken                FeesCollection[]              @relation("FeesCollectionTakenBy")
  feesCollectionsOwned                FeesCollection[]              @relation("FeesCollectionPerson")
  feeInvoicesCancelled                FeeInvoice[]
  applicationFormRelationships        ApplicationFormRelationship[]
  applicationFormsAsParent1           ApplicationForm[]             @relation("ApplicationFormParent1")
  paymentsRecorded                    Payment[]
  studentEnrolments                   StudentEnrolment[]
  moduleButtonPermissions             ModuleButtonPermission[]

  @@index([username, email], map: "username_2")
  @@map("pupilsightPerson")
}

enum FamilyStatus {
  Married
  Separated
  Divorced
  DeFacto   @map("De Facto")
  Other
}

/// pupilsightFamily — household grouping; ApplicationForm.familyId points here.
model Family {
  id          Int           @id @default(autoincrement()) @map("pupilsightFamilyID")
  name        String        @db.Text
  nameAddress String?       @db.VarChar(255)
  status      FamilyStatus?
  familySync  String?       @db.VarChar(50)

  applicationForms ApplicationForm[]

  // Note: household "adult" members are linked via pupilsightFamilyAdult, a
  // junction table intentionally out of scope here (Family module) — so no
  // direct Person relation is modeled on this side.

  @@map("pupilsightFamily")
}

enum PaymentType {
  Online
  BankTransfer @map("Bank Transfer")
  Cash
  Cheque
  Other
  CreditCard   @map("Credit Card")
}

enum PaymentStatus {
  Complete
  Partial
  Final
  Failure
}

enum OnlineTransactionStatus {
  Success
  Failure
}

/// pupilsightPayment — generic polymorphic payment record (foreignTable/foreignTableID
/// point at whichever table recorded the payment, e.g. pupilsightApplicationForm).
model Payment {
  id                      Int                      @id @default(autoincrement()) @map("pupilsightPaymentID")
  foreignTable            String                   @db.VarChar(50)
  foreignTableId          Int                      @map("foreignTableID")
  personId                Int?                     @map("pupilsightPersonID")
  person                  Person?                  @relation(fields: [personId], references: [id])
  type                    PaymentType              @default(Online)
  status                  PaymentStatus            @default(Complete)
  amount                  Decimal                  @db.Decimal(13, 2)
  gateway                 String?                  @db.VarChar(50) // enum('Paypal') in source
  onlineTransactionStatus OnlineTransactionStatus?
  paymentToken            String?                  @db.VarChar(50)
  paymentPayerId          String?                  @map("paymentPayerID") @db.VarChar(50)
  paymentTransactionId    String?                  @map("paymentTransactionID") @db.VarChar(50)
  paymentReceiptId        String?                  @map("paymentReceiptID") @db.VarChar(50)
  timestamp               DateTime                 @default(now())

  applicationForms ApplicationForm[]

  @@map("pupilsightPayment")
}

/// pupilsightStudentEnrolment — the record created once an applicant converts to an enrolled student.
model StudentEnrolment {
  id           Int                         @id @default(autoincrement()) @map("pupilsightStudentEnrolmentID")
  personId     Int                         @map("pupilsightPersonID")
  person       Person                      @relation(fields: [personId], references: [id])
  schoolYearId Int                         @map("pupilsightSchoolYearID")
  schoolYear   SchoolYear                  @relation(fields: [schoolYearId], references: [id])
  mappingId    Int?                        @map("pupilsightMappingID")
  mapping      ProgramClassSectionMapping? @relation(fields: [mappingId], references: [id])
  programId    Int?                        @map("pupilsightProgramID")
  program      Program?                    @relation(fields: [programId], references: [id])
  yearGroupId  Int                         @map("pupilsightYearGroupID")
  yearGroup    YearGroup                   @relation(fields: [yearGroupId], references: [id])
  rollGroupId  Int?                        @map("pupilsightRollGroupID")
  rollGroup    RollGroup?                  @relation(fields: [rollGroupId], references: [id])
  rollOrder    Int?
  tcTaken      Boolean                     @default(false) @map("tc_taken")
  active       Int                         @default(1)
  cdt          DateTime                    @default(now())

  @@index([schoolYearId])
  @@index([yearGroupId])
  @@index([rollGroupId])
  @@index([personId, schoolYearId], map: "pupilsightPersonIndex")
  @@map("pupilsightStudentEnrolment")
}

/// fee_category — simple fee-category lookup Person.feeCategoryId points at.
model FeeCategory {
  id     Int    @id @default(autoincrement())
  name   String @unique @db.VarChar(50)
  status Int    @default(1) // 1 - active, 0 - inactive

  persons Person[]

  @@map("fee_category")
}

/// fn_masters — shared lookup table for payment modes and banks, discriminated by `type`.
model FnMaster {
  id   Int    @id @default(autoincrement())
  name String @db.VarChar(128)
  type String @db.VarChar(128) // 'payment_mode' | 'bank'

  feesCollectionsAsPaymentMode FeesCollection[] @relation("FeesCollectionPaymentMode")
  feesCollectionsAsBank        FeesCollection[] @relation("FeesCollectionBank")

  @@map("fn_masters")
}

enum ModuleType {
  Core
  Additional
}

/// pupilsightModule — generic system-wide module registry (every installed module gets a row).
/// The Campaign/Admission module is row id 178 in this installation; kept here only as far as
/// needed for `ModuleButton`/`ModuleButtonPermission` (the "Button Permission" screen), which are
/// a shared core mechanism reused by every module, not something Admission-specific.
model Module {
  id          Int        @id @default(autoincrement()) @map("pupilsightModuleID")
  name        String     @unique(map: "pupilsightModuleName") @db.VarChar(30)
  description String     @db.Text
  entryURL    String     @default("index.php") @db.VarChar(255)
  type        ModuleType @default(Core)
  active      YesNo      @default(Y)
  category    String     @db.VarChar(255)
  version     String     @db.VarChar(6)
  author      String     @db.VarChar(40)
  url         String     @db.VarChar(255)

  buttons     ModuleButton[]
  permissions ModuleButtonPermission[]

  @@map("pupilsightModule")
}

/// pupilsightModuleButton — a named UI action button registered by a module (e.g. Campaign's
/// "Add Campaign", "Manage Series", "Delete", etc. all show up here under moduleId 178).
model ModuleButton {
  id       Int    @id @default(autoincrement()) @map("pupilsightModuleButtonID")
  moduleId Int    @map("pupilsightModuleID")
  module   Module @relation(fields: [moduleId], references: [id])
  name     String @db.VarChar(255)

  permissions ModuleButtonPermission[]

  @@map("pupilsightModuleButton")
}

/// pupilsightModuleButtonPermission — which Person may see/click a given ModuleButton.
/// Distinct from `WorkflowTransition.userPermission` (which gates a specific pipeline
/// transition): this gates a named UI button for the whole module, independent of any
/// particular admission workflow state.
model ModuleButtonPermission {
  id             Int           @id @default(autoincrement())
  moduleId       Int           @map("pupilsightModuleID")
  module         Module        @relation(fields: [moduleId], references: [id])
  moduleButtonId Int?          @map("pupilsightModuleButtonID")
  moduleButton   ModuleButton? @relation(fields: [moduleButtonId], references: [id])
  name           String?       @db.VarChar(255) // denormalized copy of ModuleButton.name at time of grant
  personId       Int           @map("pupilsightPersonID")
  person         Person        @relation(fields: [personId], references: [id])

  @@map("pupilsightModuleButtonPermission")
}

// -----------------------------------------------------------------------------
// CAMPAIGN (Admission drive / intake)
// -----------------------------------------------------------------------------

/// campaign — an admission drive/intake: dates, seats, linked application forms,
/// fee structure and branding/templates for generated documents.
model Campaign {
  id                      Int                        @id @default(autoincrement())
  name                    String                     @db.VarChar(256)
  description             String?                    @db.VarChar(512)
  schoolYearId            Int                        @map("academic_id")
  schoolYear              SchoolYear                 @relation(fields: [schoolYearId], references: [id])
  academicYear            String                     @map("academic_year") @db.VarChar(256) // denormalized label
  programIdsCsv           String?                    @map("pupilsightProgramID") @db.VarChar(255) // CSV of Program ids
  classIdsCsv             String                     @map("classes") @db.VarChar(256) // CSV of YearGroup ids
  campaignSeriesId        Int?                       @map("campaign_series_id")
  applicationSeriesId     Int?                       @map("application_series_id")
  admissionSeriesId       BigInt?                    @map("admission_series_id") // [sic] declared int(11) in source; widened to match FeeSeries.id
  admissionSeries         FeeSeries?                 @relation("CampaignAdmissionSeries", fields: [admissionSeriesId], references: [id])
  startDate               DateTime
  endDate                 DateTime
  status                  Int // 1 draft | 2 published | 3 stopped
  seats                   Int?
  limitApplyForm          Int?                       @map("limit_apply_form")
  formId                  Int?                       @map("form_id")
  onlineForm              FluentForm?                @relation("CampaignOnlineForm", fields: [formId], references: [id])
  pageLink                String?                    @map("page_link") @db.Text
  pageFor                 Int?                       @map("page_for") // 1 public | 2 private
  offlineFormId           Int?                       @map("offline_form_id")
  offlineForm             FluentForm?                @relation("CampaignOfflineForm", fields: [offlineFormId], references: [id])
  offlinePageLink         String?                    @map("offline_page_link") @db.Text
  feeStructureId          Int?                       @map("fn_fee_structure_id")
  feeStructure            FeeStructure?              @relation(fields: [feeStructureId], references: [id])
  feesReceiptTemplateId   Int?                       @map("fn_fees_receipt_template_id")
  feesReceiptTemplate     FeesReceiptTemplateMaster? @relation(fields: [feesReceiptTemplateId], references: [id])
  isPublishParent         Boolean                    @default(false) @map("is_publish_parent")
  templateName            String?                    @map("template_name") @db.VarChar(255)
  templatePath            String?                    @map("template_path") @db.Text
  templateFilename        String?                    @map("template_filename") @db.VarChar(255)
  offlineTemplateName     String?                    @map("offline_template_name") @db.VarChar(255)
  offlineTemplatePath     String?                    @map("offline_template_path") @db.Text
  offlineTemplateFilename String?                    @map("offline_template_filename") @db.VarChar(255)
  emailTemplateId         Int?                       @map("email_template_id")
  smsTemplateId           Int?                       @map("sms_template_id")
  allowMultipleSubmission Boolean                    @default(false) @map("allow_multiple_submission")
  isFeeGenerate           Int?                       @default(0) @map("is_fee_generate") // 1 Fee Payment | 2 Invoice Generation
  creatorId               Int?                       @map("cuid")
  creator                 Person?                    @relation("CampaignCreator", fields: [creatorId], references: [id])
  createdAt               DateTime                   @map("cdt")
  updatedAt               DateTime                   @map("udt")

  progClasses         CampaignProgClass[]
  formStatuses        CampaignFormStatus[]
  parentRegistrations CampaignParentRegistration[]
  paymentAttachments  CampaignPaymentAttachment[]
  imageTemplates      CampaignConfigureImageTemplate[]
  emailSmsSentDetails CampaignEmailSmsSentDetail[]
  transitionsFormMaps CampaignTransitionsFormMap[]
  seatMatrices        SeatMatrix[]
  workflowMaps        WorkflowMap[]
  workflowTransitions WorkflowTransition[]

  @@map("campaign")
}

/// campaign_prog_class — which Program+YearGroup combinations a campaign accepts applications for.
model CampaignProgClass {
  id          Int       @id @default(autoincrement())
  campaignId  Int       @map("campaign_id")
  campaign    Campaign  @relation(fields: [campaignId], references: [id])
  programId   Int       @map("pupilsightProgramID")
  program     Program   @relation(fields: [programId], references: [id])
  yearGroupId Int       @map("pupilsightYearGroupID")
  yearGroup   YearGroup @relation(fields: [yearGroupId], references: [id])

  @@map("campaign_prog_class")
}

/// campaign_form_status — workflow state-transition history per submission.
model CampaignFormStatus {
  id            Int                  @id @default(autoincrement())
  campaignId    Int                  @map("campaign_id")
  campaign      Campaign             @relation(fields: [campaignId], references: [id])
  formId        Int                  @map("form_id")
  form          FluentForm           @relation(fields: [formId], references: [id])
  submissionId  Int                  @map("submission_id")
  submission    FluentFormSubmission @relation(fields: [submissionId], references: [id])
  state         String               @db.VarChar(256) // denormalized state name
  stateId       Int                  @map("state_id")
  workflowState WorkflowState        @relation(fields: [stateId], references: [id])
  status        Int                  @default(2) // 1 True (current row) | 2 False
  personId      Int?                 @map("pupilsightPersonID")
  person        Person?              @relation(fields: [personId], references: [id])
  remarks       String?              @db.Text
  createdAt     DateTime             @map("cdt")
  updatedAt     DateTime             @map("udt")

  @@map("campaign_form_status")
}

/// campaign_parent_registration — parent self-registration before submitting an application.
model CampaignParentRegistration {
  id         Int      @id @default(autoincrement())
  campaignId Int      @map("campaign_id")
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  personId   Int      @map("pupilsightPersonID")
  person     Person   @relation(fields: [personId], references: [id])
  name       String   @db.VarChar(256)
  email      String   @db.VarChar(256)
  mobile     String   @db.VarChar(256)
  createdAt  DateTime @default(now()) @map("cdt")

  emailSmsSentDetails CampaignEmailSmsSentDetail[]

  @@map("campaign_parent_registration")
}

enum CampaignPaymentAttachmentType {
  RegistrationFeePaid @map("Registration Fee Paid")
  TermFeePaid         @map("Term Fee Paid")
}

/// campaign_payment_attachment — manual/offline proof of admission-fee payment.
model CampaignPaymentAttachment {
  id            Int                            @id @default(autoincrement())
  type          CampaignPaymentAttachmentType?
  campaignId    Int                            @map("campaign_id")
  campaign      Campaign                       @relation(fields: [campaignId], references: [id])
  submissionId  Int                            @map("submission_id")
  submission    FluentFormSubmission           @relation(fields: [submissionId], references: [id])
  payAmount     Decimal?                       @map("pay_amount") @db.Decimal(12, 2)
  payDate       DateTime?                      @map("pay_date") @db.Date
  payAttachment String?                        @map("pay_attachment") @db.Text

  @@map("campaign_payment_attachment")
}

/// campaign_configure_image_template — pixel coordinates for stamping applicant data onto a printed template.
model CampaignConfigureImageTemplate {
  id           Int       @id @default(autoincrement())
  campaignId   Int?      @map("campaign_id")
  campaign     Campaign? @relation(fields: [campaignId], references: [id])
  fieldName    String?   @map("field_name") @db.VarChar(255)
  templateType String?   @map("template_type") @db.VarChar(255)
  x            Int?
  y            Int?
  pageNo       Int?      @map("page_no")
  width        Int?
  height       Int?

  @@map("campaign_configure_image_template")
}

/// campaign_email_sms_sent_details — communication log for campaign/workflow-state notifications.
model CampaignEmailSmsSentDetail {
  id                           Int                         @id @default(autoincrement())
  campaignId                   Int?                        @map("campaign_id")
  campaign                     Campaign?                   @relation(fields: [campaignId], references: [id])
  submissionId                 Int?                        @map("submission_id")
  submission                   FluentFormSubmission?       @relation(fields: [submissionId], references: [id])
  campaignParentRegistrationId Int?                        @map("campaign_parent_registration_id")
  campaignParentRegistration   CampaignParentRegistration? @relation(fields: [campaignParentRegistrationId], references: [id])
  stateId                      Int?                        @map("state_id")
  workflowState                WorkflowState?              @relation(fields: [stateId], references: [id])
  stateName                    String?                     @map("state_name") @db.VarChar(100)
  email                        String?                     @db.VarChar(100)
  phone                        String?                     @db.VarChar(100)
  subject                      String?                     @db.VarChar(255)
  description                  String                      @db.Text
  attachment                   String?                     @db.Text
  personId                     Int                         @map("pupilsightPersonID")
  person                       Person                      @relation(fields: [personId], references: [id])
  createdAt                    DateTime                    @default(now()) @map("cdt") // source column also auto-updates on UPDATE

  @@map("campaign_email_sms_sent_details")
}

/// campaign_transitions_form_map — maps a workflow transition to which FluentForm field
/// writes into which downstream table/column (used to sync applicant data on state change).
model CampaignTransitionsFormMap {
  id                   Int                @id @default(autoincrement())
  transitionId         Int                @map("transition_id")
  transition           WorkflowTransition @relation(fields: [transitionId], references: [id])
  campaignId           Int?               @map("campaign_id")
  campaign             Campaign?          @relation(fields: [campaignId], references: [id])
  tableName            String             @map("table_name") @db.VarChar(255)
  columnName           String             @map("column_name") @db.VarChar(255)
  fluentFormColumnName String             @map("fluent_form_column_name") @db.VarChar(256)
  creatorId            Int?               @map("cuid")
  creator              Person?            @relation(fields: [creatorId], references: [id])
  createdAt            DateTime           @map("cdt")
  updatedAt            DateTime           @map("udt")

  @@map("campaign_transitions_form_map")
}

/// seatmatrix — seat capacity per campaign/program/class, with an age-eligibility window.
model SeatMatrix {
  id             Int        @id @default(autoincrement())
  campaignId     Int        @map("campaignid")
  campaign       Campaign   @relation(fields: [campaignId], references: [id])
  programId      Int?       @map("pupilsightProgramID")
  program        Program?   @relation(fields: [programId], references: [id])
  yearGroupId    Int?       @map("pupilsightYearGroupID")
  yearGroup      YearGroup? @relation(fields: [yearGroupId], references: [id])
  name           String     @db.VarChar(256)
  seats          Int
  remainingSeats Int?       @map("remaining_seats")
  usedSeats      Int?       @map("used_seats")
  ageStartDate   DateTime?  @map("age_start_date") @db.Date
  ageEndDate     DateTime?  @map("age_end_date") @db.Date
  creatorId      Int?       @map("cuid")
  creator        Person?    @relation(fields: [creatorId], references: [id])
  createdAt      DateTime   @default(now()) @map("cdt")
  updatedAt      DateTime   @default(now()) @map("udt")

  @@map("seatmatrix")
}

// -----------------------------------------------------------------------------
// WORKFLOW (admission pipeline state machine)
// -----------------------------------------------------------------------------

/// workflow — a named state-machine definition (e.g. "Standard Admission Flow").
model Workflow {
  id           Int      @id @default(autoincrement())
  name         String   @db.VarChar(256)
  academicYear String?  @map("academic_year") @db.VarChar(256)
  description  String?  @db.VarChar(512)
  code         String   @db.VarChar(256)
  creatorId    Int?     @map("cuid")
  creator      Person?  @relation(fields: [creatorId], references: [id])
  createdAt    DateTime @map("cdt")
  updatedAt    DateTime @map("udt")

  maps   WorkflowMap[]
  states WorkflowState[]

  @@map("workflow")
}

/// workflow_map — links a Workflow definition to the Campaign(s) using it.
model WorkflowMap {
  id         Int       @id @default(autoincrement())
  workflowId Int       @map("workflow_id")
  workflow   Workflow  @relation(fields: [workflowId], references: [id])
  campaignId Int?      @map("campaign_id")
  campaign   Campaign? @relation(fields: [campaignId], references: [id])
  creatorId  Int?      @map("cuid")
  creator    Person?   @relation(fields: [creatorId], references: [id])
  createdAt  DateTime  @map("cdt")
  updatedAt  DateTime  @map("udt")

  @@map("workflow_map")
}

/// workflow_state — a discrete pipeline state (e.g. Applied / Interview / Offer / Admitted / Rejected).
model WorkflowState {
  id             Int      @id @default(autoincrement())
  workflowId     Int      @map("workflowid")
  workflow       Workflow @relation(fields: [workflowId], references: [id])
  orderWise      Int      @map("order_wise")
  name           String   @db.VarChar(256)
  code           String   @db.VarChar(256)
  displayName    String?  @map("display_name") @db.VarChar(256)
  notification   Int // 1 Email | 2 SMS | 3 Email+SMS
  templateIdsCsv String?  @map("pupilsightTemplateIDs") @db.VarChar(100)
  creatorId      Int      @map("cuid")
  creator        Person   @relation(fields: [creatorId], references: [id])
  createdAt      DateTime @map("cdt")
  updatedAt      DateTime @map("udt")

  campaignFormStatuses        CampaignFormStatus[]
  campaignEmailSmsSentDetails CampaignEmailSmsSentDetail[]
  feeAdmissionSettings        FeeAdmissionSetting[]
  feeInvoiceApplicantAssigns  FeeInvoiceApplicantAssign[]
  redirectingTransitions      WorkflowTransition[]         @relation("WorkflowTransitionRedirectState")

  @@map("workflow_state")
}

/// workflow_transition — an allowed state→state move, plus side effects (invoice generation, permissions).
model WorkflowTransition {
  id                        Int            @id @default(autoincrement())
  campaignId                Int            @map("campaign_id")
  campaign                  Campaign       @relation(fields: [campaignId], references: [id])
  fromState                 String         @map("from_state") @db.VarChar(256)
  toState                   String         @map("to_state") @db.VarChar(256)
  transitionDisplayName     String?        @map("transition_display_name") @db.VarChar(512)
  autoGenInv                String         @map("auto_gen_inv") @db.VarChar(256)
  transitionAction          String         @map("tansition_action") @db.VarChar(256) // [sic] typo'd column name in source DB
  screenTabDef              String?        @map("screen_tab_def") @db.VarChar(256)
  userPermission            String?        @map("user_permission") @db.Text // CSV of pupilsightStaffID (Person.id) values allowed to execute this transition
  feeAdmissionSettingIdsCsv String?        @map("fn_fee_admission_setting_ids") @db.VarChar(100)
  enableRemark              Int?           @default(0) @map("enable_remark")
  redirectStateId           Int?           @map("redirect_state_id")
  redirectState             WorkflowState? @relation("WorkflowTransitionRedirectState", fields: [redirectStateId], references: [id])
  creatorId                 Int?           @map("cuid")
  creator                   Person?        @relation(fields: [creatorId], references: [id])
  createdAt                 DateTime       @map("cdt")
  updatedAt                 DateTime       @map("udt")

  transitionsFormMaps CampaignTransitionsFormMap[]

  @@map("workflow_transition")
}

// -----------------------------------------------------------------------------
// APPLICATION FORM (WordPress FluentForm-backed — the live applicant store)
// -----------------------------------------------------------------------------

/// wp_fluentform_forms — one form definition per campaign's online/offline application form.
model FluentForm {
  id                 Int       @id @default(autoincrement())
  title              String    @db.VarChar(255)
  status             String?   @default("Draft") @db.VarChar(45)
  appearanceSettings String?   @map("appearance_settings") @db.Text
  formFields         String?   @map("form_fields") @db.LongText // JSON field schema
  hasPayment         Boolean   @default(false) @map("has_payment")
  type               String?   @db.VarChar(45)
  conditions         String?   @db.Text
  createdBy          Int?      @map("created_by")
  createdAt          DateTime? @map("created_at")
  updatedAt          DateTime? @map("updated_at")

  submissions          FluentFormSubmission[]
  campaignsOnlineForm  Campaign[]             @relation("CampaignOnlineForm")
  campaignsOfflineForm Campaign[]             @relation("CampaignOfflineForm")
  campaignFormStatuses CampaignFormStatus[]

  @@map("wp_fluentform_forms")
}

/// wp_fluentform_submissions — the Applicant record: one row per submitted application/enquiry.
///
/// Note: declared `bigint(20) unsigned` in the source table, but every other table's
/// `submission_id` FK-like column declares `int(11)` — modeled as `Int` here so all
/// relations type-check consistently; widen to `BigInt` if submission volume nears 2^31.
model FluentFormSubmission {
  id                  Int         @id @default(autoincrement())
  formId              Int?        @map("form_id")
  form                FluentForm? @relation(fields: [formId], references: [id])
  serialNumber        Int?        @map("serial_number")
  response            String?     @db.LongText // JSON blob of all field answers
  sourceUrl           String?     @map("source_url") @db.VarChar(255)
  userId              Int?        @map("user_id")
  status              String?     @default("unread") @db.VarChar(45) // read | unread | trashed
  isFavourite         Boolean     @default(false) @map("is_favourite")
  browser             String?     @db.VarChar(45)
  device              String?     @db.VarChar(45)
  ip                  String?     @db.VarChar(45)
  city                String?     @db.VarChar(45)
  country             String?     @db.VarChar(45)
  paymentStatus       String?     @map("payment_status") @db.VarChar(45)
  paymentMethod       String?     @map("payment_method") @db.VarChar(45)
  paymentType         String?     @map("payment_type") @db.VarChar(45)
  currency            String?     @db.VarChar(45)
  totalPaid           Float?      @map("total_paid")
  personId            Int?        @map("pupilsightPersonID")
  person              Person?     @relation(fields: [personId], references: [id])
  programId           Int?        @map("pupilsightProgramID")
  program             Program?    @relation(fields: [programId], references: [id])
  yearGroupId         Int?        @map("pupilsightYearGroupID")
  yearGroup           YearGroup?  @relation(fields: [yearGroupId], references: [id])
  applicationId       String?     @map("application_id") @db.VarChar(255) // human-readable application number
  feeInvoiceId        Int?        @map("fn_fee_invoice_id")
  feeInvoice          FeeInvoice? @relation(fields: [feeInvoiceId], references: [id])
  invoiceNo           String?     @map("invoice_no") @db.VarChar(100)
  isConverted         Boolean     @default(false) @map("is_converted") // converted to an enrolled Student
  isContractGenerated Boolean     @default(false) @map("is_contract_generated")
  createdAt           DateTime?   @map("created_at")
  updatedAt           DateTime?   @map("updated_at")
  paymentTotal        Float?      @map("payment_total")

  entryDetails                FluentFormEntryDetail[]
  campaignFormStatuses        CampaignFormStatus[]
  campaignPaymentAttachments  CampaignPaymentAttachment[]
  campaignEmailSmsSentDetails CampaignEmailSmsSentDetail[]
  feeInvoiceApplicantAssigns  FeeInvoiceApplicantAssign[]
  feesApplicantCollections    FeesApplicantCollection[]
  feePaymentDetails           FeePaymentDetail[]
  feesCollections             FeesCollection[]

  @@map("wp_fluentform_submissions")
}

/// wp_fluentform_entry_details — normalized per-field answers (parallel/legacy to the JSON `response` blob).
model FluentFormEntryDetail {
  id           Int                   @id @default(autoincrement())
  formId       Int?                  @map("form_id") // not modeled as a relation: source declares bigint(20) vs wp_fluentform_forms.id int(10)
  submissionId Int?                  @map("submission_id")
  submission   FluentFormSubmission? @relation(fields: [submissionId], references: [id])
  fieldName    String?               @map("field_name") @db.VarChar(255)
  subFieldName String?               @map("sub_field_name") @db.VarChar(255)
  fieldValue   String?               @map("field_value") @db.LongText
  status       Int                   @default(0)

  @@map("wp_fluentform_entry_details")
}

// -----------------------------------------------------------------------------
// LEGACY NATIVE APPLICATION FORM (pupilsightApplicationForm*) — superseded by
// FluentForm above but still FK'd from pupilsightPerson, so kept for fidelity.
// -----------------------------------------------------------------------------

enum Gender {
  M
  F
}

enum ApplicationFormStatus {
  Pending
  WaitingList @map("Waiting List")
  Accepted
  Rejected
  Withdrawn
}

enum PhoneType {
  Unspecified @map("")
  Mobile
  Home
  Work
  Fax
  Pager
  Other
}

enum ParentGender {
  M
  F
  Other
  Unspecified
}

enum PaymentBillingType {
  Family
  Company
}

enum PaymentMadeStatus {
  N
  Y
  Exemption
}

/// pupilsightApplicationForm — legacy native admission application (student + both
/// parents + siblings + prior schools + billing), superseded by FluentForm submissions
/// but still referenced by `pupilsightPerson.pupilsightApplicationFormID`.
model ApplicationForm {
  id                          Int                   @id @default(autoincrement()) @map("pupilsightApplicationFormID")
  hash                        String?               @map("pupilsightApplicationFormHash") @db.VarChar(40)
  surname                     String                @default("") @db.VarChar(60)
  firstName                   String                @default("") @db.VarChar(60)
  preferredName               String                @default("") @db.VarChar(60)
  officialName                String                @db.VarChar(150)
  nameInCharacters            String                @db.VarChar(20)
  gender                      Gender                @default(M)
  username                    String?               @db.VarChar(20)
  status                      ApplicationFormStatus @default(Pending)
  dob                         DateTime?             @db.Date
  email                       String?               @db.VarChar(75)
  homeAddress                 String?               @db.MediumText
  homeAddressDistrict         String?               @db.VarChar(255)
  homeAddressCountry          String?               @db.VarChar(255)
  phone1Type                  PhoneType             @default(Unspecified)
  phone1CountryCode           String                @db.VarChar(7)
  phone1                      String                @db.VarChar(20)
  phone2Type                  PhoneType             @default(Unspecified)
  phone2CountryCode           String                @db.VarChar(7)
  phone2                      String                @db.VarChar(20)
  countryOfBirth              String                @db.VarChar(30)
  citizenship1                String                @db.VarChar(255)
  citizenship1Passport        String                @db.VarChar(30)
  nationalIDCardNumber        String                @db.VarChar(30)
  residencyStatus             String                @db.VarChar(255)
  visaExpiryDate              DateTime?             @db.Date
  schoolYearIdEntry           Int                   @map("pupilsightSchoolYearIDEntry")
  schoolYearEntry             SchoolYear            @relation(fields: [schoolYearIdEntry], references: [id])
  yearGroupIdEntry            Int                   @map("pupilsightYearGroupIDEntry")
  yearGroupEntry              YearGroup             @relation(fields: [yearGroupIdEntry], references: [id])
  dayType                     String?               @db.VarChar(255)
  referenceEmail              String?               @db.VarChar(100)
  schoolName1                 String                @db.VarChar(50)
  schoolAddress1              String                @db.VarChar(255)
  schoolGrades1               String                @db.VarChar(20)
  schoolLanguage1             String                @db.VarChar(50)
  schoolDate1                 DateTime?             @db.Date
  schoolName2                 String                @db.VarChar(50)
  schoolAddress2              String                @db.VarChar(255)
  schoolGrades2               String                @db.VarChar(20)
  schoolLanguage2             String                @db.VarChar(50)
  schoolDate2                 DateTime?             @db.Date
  familyId                    Int?                  @map("pupilsightFamilyID")
  family                      Family?               @relation(fields: [familyId], references: [id])
  siblingName1                String                @db.VarChar(50)
  siblingDOB1                 DateTime?             @db.Date
  siblingSchool1              String                @db.VarChar(50)
  siblingSchoolJoiningDate1   DateTime?             @db.Date
  siblingName2                String                @db.VarChar(50)
  siblingDOB2                 DateTime?             @db.Date
  siblingSchool2              String                @db.VarChar(50)
  siblingSchoolJoiningDate2   DateTime?             @db.Date
  siblingName3                String                @db.VarChar(50)
  siblingDOB3                 DateTime?             @db.Date
  siblingSchool3              String                @db.VarChar(50)
  siblingSchoolJoiningDate3   DateTime?             @db.Date
  languageHomePrimary         String                @db.VarChar(30)
  languageHomeSecondary       String                @db.VarChar(30)
  languageFirst               String                @db.VarChar(30)
  languageSecond              String                @db.VarChar(30)
  languageThird               String                @db.VarChar(30)
  medicalInformation          String                @db.Text
  sen                         YesNo?
  senDetails                  String                @db.Text
  languageChoice              String?               @db.VarChar(100)
  languageChoiceExperience    String?               @db.Text
  scholarshipInterest         YesNo                 @default(N)
  scholarshipRequired         YesNo                 @default(N)
  payment                     PaymentBillingType    @default(Family)
  companyName                 String?               @db.VarChar(100)
  companyContact              String?               @db.VarChar(100)
  companyAddress              String?               @db.VarChar(255)
  companyEmail                String?               @db.Text
  companyCCFamily             YesNo?
  companyPhone                String?               @db.VarChar(20)
  companyAll                  YesNo?
  financeFeeCategoryIdList    String?               @map("pupilsightFinanceFeeCategoryIDList") @db.Text
  agreement                   YesNo?
  parent1PersonId             Int?                  @map("parent1pupilsightPersonID")
  parent1Person               Person?               @relation("ApplicationFormParent1", fields: [parent1PersonId], references: [id])
  parent1Title                String?               @db.VarChar(5)
  parent1Surname              String?               @default("") @db.VarChar(60)
  parent1FirstName            String?               @default("") @db.VarChar(60)
  parent1PreferredName        String?               @default("") @db.VarChar(60)
  parent1OfficialName         String?               @db.VarChar(150)
  parent1NameInCharacters     String?               @db.VarChar(20)
  parent1Gender               ParentGender?         @default(Unspecified)
  parent1Relationship         String?               @db.VarChar(50)
  parent1LanguageFirst        String?               @db.VarChar(30)
  parent1LanguageSecond       String?               @db.VarChar(30)
  parent1Citizenship1         String?               @db.VarChar(255)
  parent1NationalIDCardNumber String?               @db.VarChar(30)
  parent1ResidencyStatus      String?               @db.VarChar(255)
  parent1VisaExpiryDate       DateTime?             @db.Date
  parent1Email                String?               @db.VarChar(75)
  parent1Phone1Type           PhoneType?            @default(Unspecified)
  parent1Phone1CountryCode    String?               @db.VarChar(7)
  parent1Phone1               String?               @db.VarChar(20)
  parent1Phone2Type           PhoneType?            @default(Unspecified)
  parent1Phone2CountryCode    String?               @db.VarChar(7)
  parent1Phone2               String?               @db.VarChar(20)
  parent1Profession           String?               @db.VarChar(30)
  parent1Employer             String?               @db.VarChar(30)
  parent2Title                String?               @db.VarChar(5)
  parent2Surname              String?               @default("") @db.VarChar(60)
  parent2FirstName            String?               @default("") @db.VarChar(60)
  parent2PreferredName        String?               @default("") @db.VarChar(60)
  parent2OfficialName         String?               @db.VarChar(150)
  parent2NameInCharacters     String?               @db.VarChar(20)
  parent2Gender               ParentGender?         @default(Unspecified)
  parent2Relationship         String?               @db.VarChar(50)
  parent2LanguageFirst        String?               @db.VarChar(30)
  parent2LanguageSecond       String?               @db.VarChar(30)
  parent2Citizenship1         String?               @db.VarChar(255)
  parent2NationalIDCardNumber String?               @db.VarChar(30)
  parent2ResidencyStatus      String?               @db.VarChar(255)
  parent2VisaExpiryDate       DateTime?             @db.Date
  parent2Email                String?               @db.VarChar(75)
  parent2Phone1Type           PhoneType?            @default(Unspecified)
  parent2Phone1CountryCode    String?               @db.VarChar(7)
  parent2Phone1               String?               @db.VarChar(20)
  parent2Phone2Type           PhoneType?            @default(Unspecified)
  parent2Phone2CountryCode    String?               @db.VarChar(7)
  parent2Phone2               String?               @db.VarChar(20)
  parent2Profession           String?               @db.VarChar(30)
  parent2Employer             String?               @db.VarChar(30)
  timestamp                   DateTime?
  priority                    Int                   @default(0)
  milestones                  String                @db.Text
  notes                       String                @db.Text
  dateStart                   DateTime?             @db.Date
  rollGroupId                 Int?                  @map("pupilsightRollGroupID")
  rollGroup                   RollGroup?            @relation(fields: [rollGroupId], references: [id])
  howDidYouHear               String?               @db.VarChar(255)
  howDidYouHearMore           String?               @db.VarChar(255)
  paymentMade                 PaymentMadeStatus     @default(N)
  paymentId                   Int?                  @map("pupilsightPaymentID")
  paymentRecord               Payment?              @relation(fields: [paymentId], references: [id])
  studentIdCode               String?               @map("studentID") @db.VarChar(10)
  privacy                     String?               @db.Text
  fields                      String                @db.Text // serialized custom field values
  parent1Fields               String                @map("parent1fields") @db.Text
  parent2Fields               String                @map("parent2fields") @db.Text

  files         ApplicationFormFile[]
  linksAsForm1  ApplicationFormLink[]         @relation("ApplicationFormLinkAsForm1")
  linksAsForm2  ApplicationFormLink[]         @relation("ApplicationFormLinkAsForm2")
  relationships ApplicationFormRelationship[]
  persons       Person[]

  @@map("pupilsightApplicationForm")
}

/// pupilsightApplicationFormFile — file uploads attached to a legacy application form.
model ApplicationFormFile {
  id                Int             @id @default(autoincrement()) @map("pupilsightApplicationFormFileID")
  applicationFormId Int             @map("pupilsightApplicationFormID")
  applicationForm   ApplicationForm @relation(fields: [applicationFormId], references: [id])
  name              String          @db.VarChar(255)
  path              String          @db.VarChar(255)

  @@map("pupilsightApplicationFormFile")
}

/// pupilsightApplicationFormLink — links sibling application forms to each other.
model ApplicationFormLink {
  id                 Int             @id @default(autoincrement()) @map("pupilsightApplicationFormLinkID")
  applicationFormId1 Int             @map("pupilsightApplicationFormID1")
  applicationForm1   ApplicationForm @relation("ApplicationFormLinkAsForm1", fields: [applicationFormId1], references: [id])
  applicationFormId2 Int             @map("pupilsightApplicationFormID2")
  applicationForm2   ApplicationForm @relation("ApplicationFormLinkAsForm2", fields: [applicationFormId2], references: [id])
  linkedAt           DateTime        @default(now()) @map("timestamp")

  @@unique([applicationFormId1, applicationFormId2], map: "link")
  @@map("pupilsightApplicationFormLink")
}

/// pupilsightApplicationFormRelationship — which Person is related to a legacy application form, and how.
model ApplicationFormRelationship {
  id                Int             @id @default(autoincrement()) @map("pupilsightApplicationFormRelationshipID")
  applicationFormId Int             @map("pupilsightApplicationFormID")
  applicationForm   ApplicationForm @relation(fields: [applicationFormId], references: [id])
  personId          Int             @map("pupilsightPersonID")
  person            Person          @relation(fields: [personId], references: [id])
  relationship      String          @db.VarChar(50)

  @@map("pupilsightApplicationFormRelationship")
}

// -----------------------------------------------------------------------------
// ADMISSION FINANCE (fn_fee_admission_settings, applicant invoices/collections)
// -----------------------------------------------------------------------------

/// fn_fee_admission_settings — per-Program/YearGroup fee structure + invoice count,
/// bound to the WorkflowState at which the invoice should be raised.
model FeeAdmissionSetting {
  id             Int            @id @default(autoincrement())
  schoolYearId   Int            @map("pupilsightSchoolYearID")
  schoolYear     SchoolYear     @relation(fields: [schoolYearId], references: [id])
  programIdsCsv  String?        @map("pupilsightProgramID") @db.VarChar(256)
  feeStructureId Int            @map("fn_fee_structure_id")
  feeStructure   FeeStructure   @relation(fields: [feeStructureId], references: [id])
  classIdsCsv    String         @map("classes") @db.VarChar(256)
  progClass      String?        @map("prog_class") @db.VarChar(255)
  amount         Int?
  noOfInvoices   Int?           @map("no_of_invoices")
  stateId        Int?           @map("state_id")
  state          WorkflowState? @relation(fields: [stateId], references: [id])

  // Note: workflow_transition.fn_fee_admission_setting_ids links here via an
  // app-level CSV of ids (no real FK column exists on either side), so it is
  // not modeled as a Prisma relation — see WorkflowTransition.feeAdmissionSettingIdsCsv.

  @@map("fn_fee_admission_settings")
}

/// fn_fee_invoice_applicant_assign — an invoice assigned to an applicant (FluentForm submission).
model FeeInvoiceApplicantAssign {
  id              BigInt               @id @default(autoincrement())
  submissionId    Int                  @map("submission_id")
  submission      FluentFormSubmission @relation(fields: [submissionId], references: [id])
  feeInvoiceId    Int                  @map("fn_fee_invoice_id")
  feeInvoice      FeeInvoice           @relation(fields: [feeInvoiceId], references: [id])
  invoiceNo       String?              @map("invoice_no") @db.VarChar(256)
  stateId         Int?                 @map("state_id")
  state           WorkflowState?       @relation(fields: [stateId], references: [id])
  invoiceStatus   String               @default("Not Paid") @map("invoice_status") @db.VarChar(30)
  status          Int?                 @default(1) // 1 Active | 2 InActive
  reasonForCancel String?              @map("reason_for_cancel") @db.Text
  cancelUserId    Int?                 @map("cancel_user_id")
  cancelUser      Person?              @relation(fields: [cancelUserId], references: [id])

  @@map("fn_fee_invoice_applicant_assign")
}

/// fn_fees_applicant_collection — payments collected against an applicant's invoice.
model FeesApplicantCollection {
  id                     Int                  @id @default(autoincrement())
  submissionId           Int                  @map("submission_id")
  submission             FluentFormSubmission @relation(fields: [submissionId], references: [id])
  transactionId          BigInt               @map("transaction_id")
  feesCollection         FeesCollection       @relation(fields: [transactionId], references: [transactionId])
  partialTransactionId   BigInt?              @map("partial_transaction_id")
  feesInvoiceId          Int                  @map("fn_fees_invoice_id")
  feeInvoice             FeeInvoice           @relation(fields: [feesInvoiceId], references: [id])
  feeInvoiceItemId       Int                  @map("fn_fee_invoice_item_id")
  feeInvoiceItem         FeeInvoiceItem       @relation(fields: [feeInvoiceItemId], references: [id])
  invoiceNo              String               @map("invoice_no") @db.VarChar(256)
  totalAmount            Decimal?             @map("total_amount") @db.Decimal(12, 3)
  discount               Decimal?             @db.Decimal(12, 3)
  totalAmountCollection  Decimal?             @map("total_amount_collection") @db.Decimal(12, 3)
  totalAmountPartialPaid Decimal?             @map("total_amount_partial_paid") @db.Decimal(12, 3)
  status                 Int                  @default(0) // 1 Paid | 2 Partial Paid
  isActive               Int                  @default(1) @map("is_active") // 1 Active | 2 Cancel | 3 Refund

  @@map("fn_fees_applicant_collection")
}

enum PaymentGatewayCallbackStatus {
  S
  F
  P
}

/// fn_fee_payment_details — online payment-gateway callback log for applicant payments.
model FeePaymentDetail {
  id                      Int                           @id @default(autoincrement())
  gateway                 String                        @db.VarChar(255)
  submissionId            Int?                          @map("submission_id")
  submission              FluentFormSubmission?         @relation(fields: [submissionId], references: [id])
  personId                Int?                          @map("pupilsightPersonID")
  person                  Person?                       @relation(fields: [personId], references: [id])
  eventId                 Int?                          @map("event_id")
  transactionRefNo        String?                       @map("transaction_ref_no") @db.Text
  orderId                 String?                       @map("order_id") @db.Text
  amount                  String?                       @db.VarChar(256)
  invoiceNo               String?                       @map("invoice_no") @db.VarChar(255)
  status                  PaymentGatewayCallbackStatus?
  transactionUpdateStatus Int                           @default(1) @map("transaction_update_status") // 1 Not Updated | 2 Updated
  createdAt               DateTime                      @default(now()) @map("cdt")

  @@map("fn_fee_payment_details")
}

// -----------------------------------------------------------------------------
// FINANCE CORE (fn_fee_*) — the fee-structure chain Admission directly depends on.
// Peripheral Finance-module tables (discounts, fines, counters, deposits,
// refunds, gateways) are intentionally out of scope here.
// -----------------------------------------------------------------------------

enum FeeSeriesType {
  Finance
  Admission
  Application
  TC
}

/// fn_fee_series — numbering series for invoices/receipts; `type = 'Admission'` is used by Campaign.
model FeeSeries {
  id           BigInt         @id @default(autoincrement())
  type         FeeSeriesType?
  seriesName   String         @map("series_name") @db.VarChar(256)
  description  String         @db.VarChar(512)
  format       String         @db.VarChar(256)
  formatVal    String         @map("formatval") @db.VarChar(256)
  startNumber  String?        @map("start_number") @db.VarChar(128)
  noOfDigit    Int?           @map("no_of_digit")
  startChar    String?        @map("start_char") @db.VarChar(128)
  schoolYearId Int            @map("pupilsightSchoolYearID")
  schoolYear   SchoolYear     @relation(fields: [schoolYearId], references: [id])
  programId    Int?           @map("pupilsightProgramID")
  program      Program?       @relation(fields: [programId], references: [id])
  classIdsCsv  String?        @map("classIds") @db.VarChar(255)
  createdAt    DateTime?      @map("cdt")
  updatedAt    DateTime?      @map("udt")

  numberFormats                FeeSeriesNumberFormat[]
  feesHeadsInv                 FeesHead[]              @relation("FeesHeadInvSeries")
  feesHeadsRecp                FeesHead[]              @relation("FeesHeadRecpSeries")
  feeStructuresInv             FeeStructure[]          @relation("FeeStructureInvSeries")
  feeStructuresRecp            FeeStructure[]          @relation("FeeStructureRecpSeries")
  feeInvoicesInv               FeeInvoice[]            @relation("FeeInvoiceInvSeries")
  feeInvoicesRec               FeeInvoice[]            @relation("FeeInvoiceRecSeries")
  feesCollectionsReceiptSeries FeesCollection[]
  campaignsAdmissionSeries     Campaign[]              @relation("CampaignAdmissionSeries")

  @@map("fn_fee_series")
}

/// fn_fee_series_number_format — per-series numbering configuration (start number, digit count).
model FeeSeriesNumberFormat {
  id          Int       @id @default(autoincrement())
  feeSeriesId BigInt    @map("fn_fee_series_id")
  feeSeries   FeeSeries @relation(fields: [feeSeriesId], references: [id])
  type        String?   @db.VarChar(255)
  orderWise   Int?      @map("order_wise")
  startNumber String?   @map("start_number") @db.VarChar(128)
  noOfDigit   Int?      @map("no_of_digit")
  lastNo      String?   @map("last_no") @db.VarChar(128)
  startChar   String?   @map("start_char") @db.VarChar(256)

  @@map("fn_fee_series_number_format")
}

/// fn_fees_head — an accounting head (bank account) that invoices/receipts post against.
model FeesHead {
  id                       BigInt     @id @default(autoincrement())
  schoolYearId             Int        @map("pupilsightSchoolYearID")
  schoolYear               SchoolYear @relation(fields: [schoolYearId], references: [id])
  name                     String     @db.VarChar(256)
  accountCode              String     @unique @map("account_code") @db.VarChar(256)
  description              String     @db.VarChar(512)
  bankName                 String     @map("bank_name") @db.VarChar(256)
  acNo                     String     @map("ac_no") @db.VarChar(128)
  invFeeSeriesId           BigInt     @map("inv_fee_series_id")
  invFeeSeries             FeeSeries  @relation("FeesHeadInvSeries", fields: [invFeeSeriesId], references: [id])
  recpFeeSeriesId          BigInt     @map("recp_fee_series_id")
  recpFeeSeries            FeeSeries  @relation("FeesHeadRecpSeries", fields: [recpFeeSeriesId], references: [id])
  recpFeeSeriesOnlinePay   BigInt     @map("recp_fee_series_online_pay")
  refundFeeSeriesOnlinePay BigInt     @map("refund_fee_series_online_pay")
  paymentGateway           String     @map("payment_gateway") @db.VarChar(1) // 'y' | 'n'
  paymentGatewayId         Int        @map("payment_gateway_id")
  invoiceTemplate          String?    @map("invoice_template") @db.VarChar(256)
  receiptTemplate          String?    @map("receipt_template") @db.VarChar(256)
  subAccountId             String?    @map("sub_account_id") @db.VarChar(255)
  dueDateValidation        Boolean    @default(false) @map("due_date_validation")
  createdAt                DateTime?  @map("cdt")
  updatedAt                DateTime?  @map("udt")

  feeStructures   FeeStructure[]
  feeInvoices     FeeInvoice[]
  feesCollections FeesCollection[]

  @@map("fn_fees_head")
}

/// fn_fee_structure — a reusable fee structure (e.g. "Nursery Admission Fee Structure").
model FeeStructure {
  id                  Int                @id @default(autoincrement())
  name                String             @db.VarChar(128)
  invoiceTitle        String             @map("invoice_title") @db.VarChar(256)
  schoolYearId        Int                @map("pupilsightSchoolYearID")
  schoolYear          SchoolYear         @relation(fields: [schoolYearId], references: [id])
  schoolFinanceYearId Int?               @map("pupilsightSchoolFinanceYearID")
  schoolFinanceYear   SchoolFinanceYear? @relation(fields: [schoolFinanceYearId], references: [id])
  feesHeadId          BigInt             @map("fn_fees_head_id") // [sic] declared int(11) in source; widened to match FeesHead.id
  feesHead            FeesHead           @relation(fields: [feesHeadId], references: [id])
  invFeeSeriesId      BigInt             @map("inv_fee_series_id")
  invFeeSeries        FeeSeries          @relation("FeeStructureInvSeries", fields: [invFeeSeriesId], references: [id])
  recpFeeSeriesId     BigInt?            @map("recp_fee_series_id")
  recpFeeSeries       FeeSeries?         @relation("FeeStructureRecpSeries", fields: [recpFeeSeriesId], references: [id])
  feesFineRuleId      Int?               @map("fn_fees_fine_rule_id") // Fine Rule module — out of scope, kept as plain id
  feesDiscountId      Int?               @map("fn_fees_discount_id") // Discount module — out of scope, kept as plain id
  dueDate             DateTime?          @map("due_date") @db.Date
  amountEditable      Boolean            @default(false) @map("amount_editable")
  displayFeeItem      Int                @default(1) @map("display_fee_item") // 1 Show | 2 Hide
  isConcatInvoice     Boolean?           @default(false) @map("is_concat_invoice")
  seqInstallmentNo    Int?               @map("seq_installment_NO")
  createdAt           DateTime?          @map("cdt")
  updatedAt           DateTime?          @map("udt")

  items                FeeStructureItem[]
  invoices             FeeInvoice[]
  feeAdmissionSettings FeeAdmissionSetting[]
  campaigns            Campaign[]

  @@map("fn_fee_structure")
}

/// fn_fee_structure_item — line items composing a FeeStructure.
model FeeStructureItem {
  id             Int          @id @default(autoincrement())
  feeStructureId Int          @map("fn_fee_structure_id")
  feeStructure   FeeStructure @relation(fields: [feeStructureId], references: [id])
  feeItemId      BigInt?      @map("fn_fee_item_id")
  feeItem        FeeItem?     @relation(fields: [feeItemId], references: [id])
  amount         Decimal?     @db.Decimal(11, 2)
  tax            String       @default("N") @db.VarChar(1)
  taxPercent     Decimal?     @map("tax_percent") @db.Decimal(4, 2)
  totalAmount    Decimal?     @map("total_amount") @db.Decimal(13, 2)

  @@map("fn_fee_structure_item")
}

/// fn_fee_item_type — category for fee items (e.g. "Tuition", "Transport", "Admission").
model FeeItemType {
  id   Int    @id @default(autoincrement())
  name String @db.VarChar(128)

  feeItems FeeItem[]

  @@map("fn_fee_item_type")
}

/// fn_fee_items — individual chargeable fee items referenced by fee structures/invoices.
model FeeItem {
  id            BigInt      @id @default(autoincrement())
  name          String      @db.VarChar(128)
  code          String      @db.VarChar(128)
  schoolYearId  Int         @map("pupilsightSchoolYearID")
  schoolYear    SchoolYear  @relation(fields: [schoolYearId], references: [id])
  feeItemTypeId Int         @map("fn_fee_item_type_id")
  feeItemType   FeeItemType @relation(fields: [feeItemTypeId], references: [id])
  feeItemGroup  String?     @map("fee_item_group") @db.VarChar(255)

  structureItems FeeStructureItem[]
  invoiceItems   FeeInvoiceItem[]

  @@map("fn_fee_items")
}

/// fn_fee_invoice — a generated invoice (from a FeeStructure) assigned to a class or applicant.
model FeeInvoice {
  id                       Int                @id @default(autoincrement())
  invoiceNo                String?            @map("invoice_no") @db.VarChar(256)
  feeStructureId           Int?               @map("fn_fee_structure_id")
  feeStructure             FeeStructure?      @relation(fields: [feeStructureId], references: [id])
  transportScheduleId      Int?               @map("transport_schedule_id") // Transport module — out of scope, kept as plain id
  schoolYearId             Int?               @map("pupilsightSchoolYearID")
  schoolYear               SchoolYear?        @relation(fields: [schoolYearId], references: [id])
  schoolFinanceYearId      Int?               @map("pupilsightSchoolFinanceYearID")
  schoolFinanceYear        SchoolFinanceYear? @relation(fields: [schoolFinanceYearId], references: [id])
  title                    String             @db.VarChar(128)
  feesHeadId               BigInt             @map("fn_fees_head_id") // [sic] declared int(11) in source; widened to match FeesHead.id
  feesHead                 FeesHead           @relation(fields: [feesHeadId], references: [id])
  invFeeSeriesId           BigInt             @map("inv_fn_fee_series_id")
  invFeeSeries             FeeSeries          @relation("FeeInvoiceInvSeries", fields: [invFeeSeriesId], references: [id])
  recFeeSeriesId           BigInt?            @map("rec_fn_fee_series_id")
  recFeeSeries             FeeSeries?         @relation("FeeInvoiceRecSeries", fields: [recFeeSeriesId], references: [id])
  dueDate                  DateTime?          @map("due_date") @db.Date
  amountEditable           Boolean            @default(false) @map("amount_editable")
  displayFeeItem           Int                @default(1) @map("display_fee_item")
  isConcatInvoice          Boolean?           @default(false) @map("is_concat_invoice")
  feesFineRuleId           Int?               @map("fn_fees_fine_rule_id") // Fine Rule module — out of scope
  feesDiscountId           Int?               @map("fn_fees_discount_id") // Discount module — out of scope
  createdAt                DateTime?          @map("cdt")
  updatedAt                DateTime?          @map("udt")
  status                   Int                @default(1) // 1 Active | 2 Cancel
  reasonForCancel          String?            @map("reason_for_cancel") @db.Text
  feeStructureDeleteStatus Int                @default(1) @map("fee_structure_delete_status")
  cancelUserId             Int?               @map("cancel_user_id")
  cancelUser               Person?            @relation(fields: [cancelUserId], references: [id])
  cancelDate               DateTime?          @map("cancel_date")

  items                FeeInvoiceItem[]
  classAssigns         FeeInvoiceClassAssign[]
  applicantAssigns     FeeInvoiceApplicantAssign[]
  applicantCollections FeesApplicantCollection[]
  submissions          FluentFormSubmission[]

  @@map("fn_fee_invoice")
}

/// fn_fee_invoice_item — line items composing a generated FeeInvoice.
model FeeInvoiceItem {
  id               Int        @id @default(autoincrement())
  feeInvoiceId     Int        @map("fn_fee_invoice_id")
  feeInvoice       FeeInvoice @relation(fields: [feeInvoiceId], references: [id])
  feeItemId        BigInt?    @map("fn_fee_item_id")
  feeItem          FeeItem?   @relation(fields: [feeItemId], references: [id])
  transportRouteId Int?       @map("transport_route_id") // Transport module — out of scope
  transportStopId  Int?       @map("transport_stop_id") // Transport module — out of scope
  description      String?    @db.VarChar(256)
  amount           Decimal?   @db.Decimal(12, 2)
  tax              Decimal?   @db.Decimal(5, 2)
  discount         Decimal?   @db.Decimal(10, 2)
  totalAmount      Decimal?   @map("total_amount") @db.Decimal(12, 2)

  applicantCollections FeesApplicantCollection[]

  @@map("fn_fee_invoice_item")
}

/// fn_fee_invoice_class_assign — which Program/YearGroup/RollGroup a FeeInvoice is issued to.
model FeeInvoiceClassAssign {
  id           Int        @id @default(autoincrement())
  feeInvoiceId Int        @map("fn_fee_invoice_id")
  feeInvoice   FeeInvoice @relation(fields: [feeInvoiceId], references: [id])
  programId    Int        @map("pupilsightProgramID")
  program      Program    @relation(fields: [programId], references: [id])
  yearGroupId  Int        @map("pupilsightYearGroupID")
  yearGroup    YearGroup  @relation(fields: [yearGroupId], references: [id])
  rollGroupId  Int?       @map("pupilsightRollGroupID")
  rollGroup    RollGroup? @relation(fields: [rollGroupId], references: [id])

  @@map("fn_fee_invoice_class_assign")
}

enum FeesReceiptTemplateType {
  FeeReceipt      @map("Fee Receipt")
  CancelReceipt   @map("Cancel Receipt")
  RefundReceipt   @map("Refund Receipt")
  InvoiceTemplate @map("Invoice Template")
}

/// fn_fees_receipt_template_master — printable templates for invoices/receipts, selectable per Campaign.
model FeesReceiptTemplateMaster {
  id            Int                      @id @default(autoincrement())
  type          FeesReceiptTemplateType?
  name          String                   @db.VarChar(256)
  path          String                   @db.Text
  filename      String                   @db.Text
  columnStartBy String?                  @default("serial_no") @map("column_start_by") @db.VarChar(255)

  campaigns Campaign[]

  @@map("fn_fees_receipt_template_master")
}

/// fn_fees_collection — the master payment/receipt record (also used generically outside Admission).
model FeesCollection {
  id                             Int                   @id @default(autoincrement())
  transactionId                  BigInt                @unique @map("transaction_id")
  feesTakenById                  Int?                  @map("fees_taken_by")
  feesTakenBy                    Person?               @relation("FeesCollectionTakenBy", fields: [feesTakenById], references: [id])
  feesInvoiceIdRaw               String?               @map("fn_fees_invoice_id") @db.VarChar(255) // legacy varchar, not a clean single FK
  personId                       Int?                  @map("pupilsightPersonID")
  person                         Person?               @relation("FeesCollectionPerson", fields: [personId], references: [id])
  submissionId                   Int?                  @map("submission_id")
  submission                     FluentFormSubmission? @relation(fields: [submissionId], references: [id])
  anonymousUserId                Int?                  @map("anonymous_user_id") // anonymous checkout — out of scope
  schoolYearId                   Int                   @map("pupilsightSchoolYearID")
  schoolYear                     SchoolYear            @relation(fields: [schoolYearId], references: [id])
  feesCounterId                  Int?                  @map("fn_fees_counter_id") // Counter module — out of scope
  receiptNumber                  String                @map("receipt_number") @db.VarChar(128)
  isCustom                       Int?                  @map("is_custom")
  payGatewayId                   String?               @map("pay_gateway_id") @db.VarChar(128)
  paymentModeId                  Int?                  @map("payment_mode_id")
  paymentMode                    FnMaster?             @relation("FeesCollectionPaymentMode", fields: [paymentModeId], references: [id])
  bankId                         Int?                  @map("bank_id")
  bank                           FnMaster?             @relation("FeesCollectionBank", fields: [bankId], references: [id])
  ddChequeNo                     String?               @map("dd_cheque_no") @db.VarChar(128)
  ddChequeDate                   DateTime?             @map("dd_cheque_date") @db.Date
  ddChequeAmount                 Decimal?              @map("dd_cheque_amount") @db.Decimal(10, 2)
  paymentStatus                  String?               @map("payment_status") @db.VarChar(128)
  paymentStatusUpDate            DateTime?             @map("payment_status_up_date") @db.Date
  paymentDate                    DateTime?             @map("payment_date") @db.Date
  feesHeadId                     BigInt?               @map("fn_fees_head_id") // [sic] declared int(10) unsigned in source; widened to match FeesHead.id
  feesHead                       FeesHead?             @relation(fields: [feesHeadId], references: [id])
  feesReceiptSeriesId            BigInt?               @map("fn_fees_receipt_series_id") // [sic] declared int(10) unsigned in source; widened to match FeeSeries.id
  feesReceiptSeries              FeeSeries?            @relation(fields: [feesReceiptSeriesId], references: [id])
  transactionAmount              Decimal               @map("transcation_amount") @db.Decimal(10, 2) // [sic] typo'd column name in source DB
  totalAmountWithoutFineDiscount Decimal               @map("total_amount_without_fine_discount") @db.Decimal(10, 2)
  amountPaying                   Decimal               @map("amount_paying") @db.Decimal(10, 2)
  overPayment                    Decimal?              @map("over_payment") @db.Decimal(10, 2)
  fine                           Decimal?              @db.Decimal(10, 2)
  discount                       Decimal?              @db.Decimal(10, 2)
  remarks                        String?               @db.VarChar(512)
  status                         Int                   @default(1) // 1 Active | 2 Cancel
  transactionStatus              Int                   @default(1) @map("transaction_status") // 1 Complete | 2 Cancel | 3 Refund
  createdAt                      DateTime?             @map("cdt")
  updatedAt                      DateTime?             @map("udt")
  referenceNo                    String?               @map("reference_no") @db.VarChar(50)
  referenceDate                  DateTime?             @map("reference_date") @db.Date
  instrumentNo                   String?               @map("instrument_no") @db.VarChar(255)
  instrumentDate                 DateTime?             @map("instrument_date") @db.Date
  invoiceStatus                  String?               @map("invoice_status") @db.VarChar(255)
  filename                       String?               @db.Text
  isAnonymous                    Boolean               @default(false) @map("is_anonymous")

  applicantCollections FeesApplicantCollection[]

  @@map("fn_fees_collection")
}
```
