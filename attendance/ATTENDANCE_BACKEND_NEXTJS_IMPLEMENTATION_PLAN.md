# Attendance Module - Next.js Backend Implementation Plan

**Source of truth:** legacy Attendance module tables and handlers under `modules/Attendance`, `src/Domain/Attendance`, school-year/timetable/enrolment tables, and attendance configuration screens.

**Target:** Next.js App Router server actions/route handlers, TypeScript, Prisma, MySQL, existing auth/RBAC, and the application's notification/export services.

**Frontend contract:** `ATTENDANCE_FRONTEND_NEXTJS_IMPLEMENTATION_PLAN.md`.

**Last updated:** 2026-09-22

---

## 1. Backend Design Principles

The backend owns all authorization, roster scope, date validity, lock rules, duplicate prevention, status-code validation, auditability, and notification decisions. The client may hide controls for usability but never determines whether an operation is allowed.

Use parameterized Prisma queries or typed SQL only. Do not port legacy `FIND_IN_SET` business logic, raw request IDs, domain-name branches, inverted `isActionAccessible` checks, or hardcoded role IDs. Replace them with normalized relations, permission keys, and school settings.

Attendance writes must be idempotent, transactional, versioned for optimistic concurrency, and auditable. Notification delivery is asynchronous and must not roll back a successful attendance save.

---

## 2. Canonical Data Model

Use the existing school master models for person, academic year, program, class/year group, section/roll group, enrolment, timetable, term, special day, and permissions. Add or verify the following normalized models in Prisma. Exact legacy column mappings must be confirmed against the live schema before migration.

```prisma
model AttendanceCode {
  id          Int      @id @default(autoincrement())
  shortCode   String
  name        String
  direction   String   // In | Out
  scope       String   // Onsite - ... | Offsite - ...
  active      Boolean  @default(true)
  reportable  Boolean  @default(true)
  future      Boolean  @default(false)
  sequence    Int      @default(0)
  attendance  AttendanceRecord[]
  @@map("pupilsightAttendanceCode")
}

model AttendanceConfiguration {
  id                  Int      @id @default(autoincrement())
  academicYearId      Int
  programId           Int
  attendanceType      String   // SESSION | SUBJECT | BOTH
  classIds            Json     // temporary compatibility field; normalize in migration
  lockMarking         Boolean  @default(false)
  lockFrom            DateTime?
  lockTo              DateTime?
  autoLock            Boolean  @default(false)
  smsOnAbsence        Boolean  @default(false)
  smsTemplateId       Int?
  smsRecipients       Json?
  subjectMandatory    Boolean  @default(false)
  displayFields       Json?
  defaultDisplay      String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  sessions            AttendanceSession[]
  @@unique([academicYearId, programId, attendanceType])
  @@map("attn_settings")
}

model AttendanceSession {
  id              Int      @id @default(autoincrement())
  configurationId Int
  number          Int
  name            String
  configuration   AttendanceConfiguration @relation(fields: [configurationId], references: [id])
  @@unique([configurationId, number])
  @@map("attn_session_settings")
}

model AttendanceRecord {
  id             BigInt   @id @default(autoincrement())
  personId       Int
  academicYearId Int
  programId      Int?
  yearGroupId    Int?
  rollGroupId    Int?
  departmentId   Int?
  courseClassId  Int?
  sessionNumber  Int?
  periodId       Int?
  date           DateTime @db.Date
  context        String   // PERSON | ROLL_GROUP | CLASS | SUBJECT | SELF
  codeId         Int
  reason         String?
  comment        String?
  recordedById   Int
  version        Int      @default(1)
  deletedAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  code           AttendanceCode @relation(fields: [codeId], references: [id])
  @@index([personId, date])
  @@index([academicYearId, programId, yearGroupId, rollGroupId, date])
  @@unique([personId, date, context, sessionNumber, departmentId, courseClassId, periodId, deletedAt])
  @@map("pupilsightAttendanceLogPerson_new")
}

model AttendanceBlockedDate {
  id             Int      @id @default(autoincrement())
  academicYearId Int
  date           DateTime @db.Date
  reason         String
  active         Boolean  @default(true)
  createdById    Int
  createdAt      DateTime @default(now())
  @@unique([academicYearId, date])
  @@map("attendance_blocked_date")
}

model AttendanceAuditEvent {
  id          BigInt   @id @default(autoincrement())
  recordId    BigInt?
  actorId     Int
  action      String   // CREATE | UPDATE | DELETE | NOTIFY | EXPORT
  beforeData  Json?
  afterData   Json?
  requestId   String
  createdAt   DateTime @default(now())
  @@index([recordId, createdAt])
  @@map("attendance_audit_event")
}
```

Migration requirements:

- Inspect both legacy `pupilsightAttendanceLogPerson` and `_new` tables, including all indexes and soft-delete columns.
- Preserve old IDs and timestamps during import; do not merge records only by student/date when session, subject, or context differs.
- Normalize comma-separated class/session/recipient values into relation tables in the new schema while keeping a compatibility view during rollout.
- Add a deterministic uniqueness strategy for nullable composite fields; MySQL nullable unique columns can otherwise allow duplicate logical records.
- Reconcile legacy roll-group log tables into person records plus an optional batch marker.

---

## 3. API and Server Action Contract

Use `/api/attendance/...` route handlers for query/mutation contracts that need client-side refresh or exports. Server actions may wrap the same domain services for form submissions. Every response includes `requestId`, and errors use a stable shape:

```ts
type ApiError = {
  code: string;
  message: string;
  field?: string;
  rowKey?: string;
  details?: Record<string, unknown>;
  requestId: string;
};
```

### 3.1 Query endpoints

| Method and route | Purpose |
|---|---|
| `GET /api/attendance/context/options` | Academic years, programs, classes, sections, subjects, sessions, and allowed scopes for the current user. Every dependent filter is server-scoped. |
| `GET /api/attendance/overview?date=&staffId=` | Daily class/section rows, 10-school-day history, taken state, and allowed actions. |
| `GET /api/attendance/roster?academicYearId=&programId=&yearGroupId=&rollGroupId=&date=&sessionNumber=&departmentId=` | Roster plus saved attendance, defaults, lock state, configuration, and a context version. |
| `GET /api/attendance/students/[personId]/history?...` | Staff, student, or parent-scoped history with pagination and redacted fields. |
| `GET /api/attendance/timetable?...` | Timetable cells and attendance state for a permitted date/context. |
| `GET /api/attendance/not-taken?...` | Missing section/session/period records, not just rows with an absent code. |
| `GET /api/attendance/reports/[reportKey]?...` | Paginated report data with a typed filter schema. |
| `GET /api/attendance/configurations` | Paginated configuration list. |
| `GET /api/attendance/configurations/[id]` | Configuration, sessions, dependent labels, and usage summary. |
| `GET /api/attendance/blocked-dates` | Blocked dates for an academic year/date range. |

### 3.2 Mutation endpoints

| Method and route | Purpose |
|---|---|
| `POST /api/attendance/records/bulk-upsert` | Save changed roster rows atomically where possible; returns per-row outcomes and new versions. |
| `POST /api/attendance/records/upsert` | Save one student/context record. |
| `POST /api/attendance/records/bulk-clear` | Soft-delete selected records after permission and lock checks. |
| `POST /api/attendance/future-absences` | Create future full/partial absence records for one or multiple students across selected classes/sections with batch transaction and duplicate detection. |
| `POST /api/attendance/self-register` | Record current-user self-registration after network/policy validation. |
| `POST /api/attendance/notifications/queue` | Queue notifications only for records saved by the caller and eligible recipients. |
| `POST /api/attendance/configurations` | Create configuration and sessions transactionally. |
| `PATCH /api/attendance/configurations/[id]` | Update configuration; returns usage warnings and requires expected version. |
| `DELETE /api/attendance/configurations/[id]` | Archive/delete only when policy allows; never remove referenced attendance history. |
| `POST /api/attendance/blocked-dates` | Add a blocked date. |
| `PATCH /api/attendance/blocked-dates/[id]` | Edit reason/active state. |
| `DELETE /api/attendance/blocked-dates/[id]` | Deactivate after confirmation and dependency check. |
| `GET /api/attendance/export/[reportKey]` | Stream CSV/XLSX/PDF using the same validated report filters and authorization. |

All GET endpoints are cache-controlled by user and context; attendance roster/history responses must not be shared across users. Mutations require CSRF protection where cookie auth is used, idempotency keys for bulk writes, and request-size limits.

---

## 4. Domain Services and Validation

Implement these services under `lib/domain/attendance`:

- `AttendanceAuthorizationService`: resolves permission keys and row-level scope from role, staff assignments, parent-child relationship, self-registration policy, and academic year.
- `AttendanceContextService`: validates and loads academic context, roster, sessions, subjects, timetable, and configuration.
- `AttendanceDatePolicy`: rejects future dates, closed dates, inactive terms, blocked dates, and locked ranges; permits configured special days according to policy.
- `AttendanceCodeService`: loads active codes, verifies future eligibility, role restrictions, reportability, and direction/scope consistency.
- `AttendanceRecordService`: validates, upserts, soft-deletes, versions, and audits records.
- `AttendanceBulkService`: processes changed rows, prevents cross-roster writes, limits batch size, and returns row-level outcomes.
- `AttendanceReportService`: builds safe, reusable report queries and percentage calculations with explicit treatment of no-data and non-school days.
- `AttendanceConfigurationService`: validates unique active-year configuration, class scope, session rows, lock dates, template/recipient references, and edit impact.
- `AttendanceNotificationService`: renders configured templates, creates an outbox job, deduplicates recipients, and records delivery attempts.
- `AttendanceExportService`: streams bounded exports and records export audit events.

### Bulk upsert algorithm

1. Authenticate and authorize the requested operation and full context.
2. Parse and validate the request with Zod; reject unknown student IDs, codes, sessions, subjects, and context combinations.
3. Load the permitted roster and compare submitted row keys with the roster snapshot/version.
4. Check date, school-day, special-day, blocked-date, configuration-lock, and auto-lock policies.
5. Start a transaction. For each changed row, locate the logical record using the normalized unique key and expected version.
6. Insert or update the row, increment version, and write an audit event with before/after data.
7. Commit. Publish notification outbox jobs only after commit.
8. Return saved, skipped, conflict, and failed row lists; never report success for rows that were not committed.

Use database constraints plus application checks. A retry with the same idempotency key must return the original result, not create another record.

---

## 5. Authorization Matrix

Seed explicit permission keys, replacing legacy file-path checks:

| Permission | Scope |
|---|---|
| `attendance.view` | View permitted overview/history/reports. |
| `attendance.mark.section` | Mark assigned or administratively allowed section sessions. |
| `attendance.mark.student` | Mark a permitted individual student. |
| `attendance.mark.timetable` | Mark permitted timetable/class periods. |
| `attendance.edit` | Edit existing records. |
| `attendance.delete` | Soft-delete/clear records. |
| `attendance.futureAbsence` | Set or cancel future absences. |
| `attendance.selfRegister` | Self-registration for the current identity. |
| `attendance.report.*` | Individual report and export permissions. |
| `attendance.configuration.view/manage/delete` | Configuration operations. |
| `attendance.blockedDate.manage` | Blocked-date operations. |
| `attendance.notification.send` | Queue SMS/email notifications. |

Row-level rules must include assigned classes/sections/subjects, active enrolment, parent-child access flag, current user identity, academic year, and any administrator override. A route must return `403` for unauthorized scope, not an empty successful response that leaks whether a record exists.

---

## 6. Reports and Calculation Rules

Centralize report semantics so daily, monthly, section, subject, not-present, and not-taken screens agree:

- `Present` means an active code whose direction/scope marks presence; do not compare only a display string.
- `Absent` means an active code configured as absence. Other codes remain separate categories.
- `Not recorded` is not absent and must be counted separately in completion reports.
- School-day denominator comes from terms/calendar/special days and the configured `countClassAsSchool` policy, not from log row count.
- Percentage is `present / eligible recorded school sessions * 100`; define zero-denominator output as `null`/`N/A`.
- Date ranges are normalized, limited to school-year boundaries, and reject future dates unless a future-absence report explicitly allows them.
- Report rows include only records in the caller's scope; exports use the same service and filters as on-screen results.
- Drill-down IDs are signed/validated route parameters, never trusted display values.

Required automated report fixtures must cover absent-only, present-only, mixed codes, no records, duplicate legacy rows, partial sessions, closed days, and multiple subjects.

---

## 7. Configuration, Locking, and Notifications

Configuration writes must run in a transaction. Validate that:

- program and classes belong to the academic year;
- the same program/year/attendance type cannot have overlapping active configurations;
- each session number is positive, unique, and has a non-empty name;
- lock dates are ordered and inside the academic year;
- selected SMS template and recipients exist and are allowed;
- configuration changes affecting recorded data produce a warning and audit event.

Lock evaluation order is: explicit blocked date, configuration lock range, auto-lock cutoff, school calendar. The response includes the source so the frontend can explain the disabled state.

Notification flow:

1. Attendance transaction commits.
2. Create one outbox item per recipient/template/event with a deduplication key.
3. Worker renders approved entities such as student name, date, session, reason, class, and section.
4. Provider secrets come only from environment/secret storage.
5. Retry transient failures with backoff; mark permanent failures and expose status to authorized staff.
6. Never log message bodies containing unnecessary personal data or provider credentials.

---

## 8. Migration and Rollout

1. Inventory live schemas, indexes, code values, settings, notification templates, and permission assignments.
2. Build a read-only compatibility adapter and compare Next.js queries against PHP results for representative users/dates.
3. Import/normalize attendance codes, configurations, sessions, blocked dates, and logs with reconciliation counts.
4. Run dual-read comparison in a non-production environment; investigate legacy duplicate records rather than silently choosing one.
5. Release read-only Next.js overview/history/reports first.
6. Release marking behind a feature flag with idempotency and audit logging enabled.
7. Enable notifications only after attendance write parity is verified.
8. Keep a rollback path to the legacy writer until reconciliation and acceptance tests pass.

Do not run the legacy `merge_old_attendance_to_new.php` blindly in production. It must be replaced by a reviewed, repeatable migration command with dry-run, counts, conflict output, and transaction boundaries.

---

## 9. Backend Build Phases and Done Criteria

| Phase | Deliverable | Done when |
|---|---|---|
| B1 | Schema audit, Prisma models, permissions | Live columns/indexes are mapped and migrations pass on a clone. |
| B2 | Context/authorization/date policy | Unauthorized, future, closed, blocked, and locked cases are covered by tests. |
| B3 | Read APIs and overview/history | Next.js results reconcile with legacy fixtures for each supported role. |
| B4 | Single and bulk writes | Upsert, version conflict, idempotency, audit, and partial-result behavior are tested. |
| B5 | Configuration/blocked dates/future absence | CRUD, overlap, lock, and dependency rules are enforced server-side. |
| B6 | Reports/export | Calculations, pagination, scope, and export parity are tested. |
| B7 | Notification outbox and workers | Provider failures do not lose attendance and retries are observable. |
| B8 | Migration, load/security hardening | Large roster, concurrent writes, tenant isolation, rate limits, and audit review pass. |

### Required test coverage

- Unit: code classification, percentage/denominator, date/lock policy, configuration validation, permission scope.
- Integration: roster load, single upsert, bulk upsert, copy-to-session, soft delete, optimistic conflict, idempotent retry, notification outbox.
- Authorization: administrator, assigned teacher, unassigned teacher, student, parent with/without child access, and anonymous user.
- Security: tampered IDs, cross-school/year access, CSRF, excessive batch size, export scope, SQL injection-shaped values, and provider-secret leakage.
- End-to-end: the acceptance scenarios in the frontend plan, including refresh/back navigation and mobile row editing.
