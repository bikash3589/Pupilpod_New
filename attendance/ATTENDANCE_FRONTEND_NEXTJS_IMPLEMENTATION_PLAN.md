# Attendance Module - Next.js Frontend Implementation Plan

**Source of truth:** `modules/Attendance/*.php`, `modules/Attendance/src/AttendanceView.php`, attendance-related reports and configuration screens in the legacy application.

**Target:** Next.js App Router, TypeScript, server actions/API routes, Prisma, the existing authentication and school master-data modules.

**Companion plan:** `ATTENDANCE_BACKEND_NEXTJS_IMPLEMENTATION_PLAN.md` defines the database, services, API contracts, authorization, and background jobs used by these screens.

**Last updated:** 2026-09-22

---

## 1. Product Goal and Non-Negotiable Behaviors

The Attendance module must let authorized users select an academic context, record attendance quickly for a class/section, record or correct an individual student's attendance, inspect history and exceptions, configure attendance sessions, and export/report on the data. Parents and students must only see their permitted history or self-registration screen.

The Next.js implementation must preserve these behaviors:

- No attendance can be saved for a future date.
- A normal school-closed date is blocked; a configured special school day may be allowed.
- Academic year, program, class, section, subject, session, and student choices are filtered by the signed-in user's permissions and assignments.
- Attendance codes, reasons, comments, session number, context, and the person who recorded the result are retained.
- Re-saving the same student/date/session/context edits the existing logical record instead of creating duplicates.
- Locked dates/configurations are read-only and show why editing is unavailable.
- A partial or failed save must identify affected rows and leave successful rows consistent.
- SMS/email is opt-in, configured, auditable, and never blocks the attendance transaction when the notification provider fails.
- All destructive actions require confirmation and are checked again on the server.

Do not copy legacy bugs such as inverted access checks, raw SQL string concatenation, tenant/domain branches, or silent HTTP redirects after failed saves.

---

## 2. Navigation and Route Map

Use a role-aware Attendance landing page. Menu items are returned by the permissions API, but deep links must still be protected by middleware and server authorization.

### 2.1 Staff routes

| Route | Screen | Entry points and navigation |
|---|---|---|
| `/attendance` | Attendance dashboard | Attendance menu; cards link to Daily Attendance, Take by Section, Take by Student, Not Taken, Reports, and Configuration. |
| `/attendance/daily` | Daily attendance overview | Dashboard card or breadcrumb. Date and optional staff filters update the URL query string. Each class/section and history day is a link to the relevant marking screen. |
| `/attendance/mark/section` | Mark attendance by section/session | Daily overview action, dashboard quick action, or direct link. Requires academic year, program, class, section, date, and session. Save returns to this screen with a result banner. |
| `/attendance/mark/student` | Mark attendance by student | Daily overview, student history, or search. Student and context stay in the URL so Back preserves the selection. |
| `/attendance/mark/timetable` | Mark timetable/subject attendance | Timetable screen cell action. The selected date and period are retained while moving between periods. |
| `/attendance/mark/secondary-section` | Mark secondary section attendance | Attendance menu when the permission is enabled. Uses the same save grid and status components as section marking. |
| `/attendance/future-absence` | Set future absence | Dashboard/report action. Supports multi-selection of classes, sections, and students (single or batch scheduling across classes/sections), full-day or partial absence, date, reason, and comment. |
| `/attendance/self-register` | Student/staff self-registration | Dedicated role-specific menu item. Shows only when the IP/network and permission policy allow it. |
| `/attendance/not-taken` | Attendance not taken | Dashboard exception card. Filter and row action link to the exact missing section/session/date. |
| `/attendance/reports` | Report index | Report cards are hidden when their permission is absent. |
| `/attendance/reports/daily` | Daily report | Filter form with date, program, class, section, and sort. Export and print preserve all filters. |
| `/attendance/reports/monthly` | Monthly attendance report | Date/month, program/class/section, percentage and status filters. Student names link to history. |
| `/attendance/reports/summary/section` | Section/session summary | Date range plus program, class, and multi-select section. Export uses the same filtered query. |
| `/attendance/reports/summary/subject` | Subject summary | Date range, program, class, section, and multi-select subject. Shows present/absent/session counts and percentage. |
| `/attendance/reports/students-not-present` | Students not present | Date, sort, and year-group filters. Each row links to student marking/history. |
| `/attendance/reports/student-history` | Student history | Student/month selector for staff; calendar/list history with optional edit action. |
| `/attendance/reports/attendance-not-taken-timetable` | Timetable gaps | Date range and academic filters; each missing cell links to timetable marking. |
| `/attendance/configuration` | Attendance configuration list | Attendance menu/configuration. Add, edit, and delete actions are permission-gated. |
| `/attendance/configuration/new` | Add attendance configuration | Back returns to list; successful Save returns to list with a success banner. |
| `/attendance/configuration/[id]/edit` | Edit attendance configuration | Cancel returns without changes; Save returns to list. Warn before changing active-year settings. |
| `/attendance/staff-configuration` | Staff attendance configurations | Separate list and add/edit screens using the same interaction pattern. |
| `/attendance/blocked-dates` | Blocked attendance dates | Add/edit/delete blocked date rules; date selection screens display the block reason. |
| `/attendance/templates` | Attendance notification templates | Link from configuration; template editor supports preview and test-send only for authorized users. |

### 2.2 Student and parent routes

| Route | Screen | Behavior |
|---|---|---|
| `/my-attendance` | Signed-in student's own history | Defaults to current academic year and current month; no student selector. |
| `/parent/children/[studentId]/attendance` | Child attendance history | Child selector is visible only for authorized children. Changing child updates the URL and reloads the permitted data. |
| `/parent/children/[studentId]/attendance/[date]` | Child day detail | Read-only status, reason, comment, session and recorded-by display. Never exposes another student's IDs or internal permissions. |

---

## 3. Shared Screen Shell and Interaction Rules

### 3.1 Shared layout

Every screen uses the application shell with:

1. Breadcrumbs: `Attendance > [screen]`.
2. Page title and a compact context summary: academic year, date/date range, program, class, section, and session where applicable.
3. Filter panel whose values are URL-search parameters and survive refresh/back navigation.
4. Results region with loading, empty, error, and stale-data states.
5. Toast/banner feedback tied to a request ID so a refresh does not duplicate a message.

Use shared components: `AttendanceFilterBar`, `AcademicContextSelects`, `DateNavigator`, `AttendanceStatusSelect`, `AttendanceReasonSelect`, `StudentAttendanceGrid`, `AttendanceHistoryStrip`, `AttendanceSummary`, `PermissionGate`, `ConfirmDialog`, `ExportButton`, and `UnsavedChangesGuard`.

### 3.2 Cascading filter behavior

- Academic year change clears program/class/section/session and reloads valid options.
- Program change clears class, section, subject, and session, then loads classes assigned to the user.
- Class change clears section and loads sections.
- Section change loads students, sessions, timetable periods, and configured subject options.
- Date change revalidates school-open/special-day/lock status and refreshes existing attendance.
- Session or subject change refreshes the grid without losing unsaved edits; warn before replacing dirty data.
- Loading disables dependent controls and displays a field-level spinner, not a blank page.
- Invalid or stale query parameters show a clear inline error and do not issue an unscoped data request.

### 3.3 Buttons and exact outcomes

| Button/action | Visible when | Click behavior |
|---|---|---|
| `Search` / `Apply filters` | Filter permission exists | Validates filters, updates query string, fetches results, scrolls to results. |
| `Today` | Date filter exists | Sets today's local school date, then revalidates whether school is open. |
| Previous/next date | User can view adjacent dates | Changes one school day at a time, preserving context; next is disabled beyond today. |
| `Set all` | User can edit the grid | Applies selected status/reason/comment to all visible students after confirmation when rows are already edited. |
| `Save attendance` | User can edit and there are dirty rows | Sends only changed rows plus context/version. Shows row-level progress and a summary. |
| `Save and notify` | Notification permission and configuration exist | Saves first, then queues notifications for selected absent students. Displays queued/failed counts. |
| `Reset changes` | Grid is dirty | Restores server values after confirmation. |
| `Edit` | User has edit permission and record is not locked | Opens the student or record editor with context in the URL. |
| `Delete` / `Clear attendance` | Delete permission and record is deletable | Confirmation includes student, date, session, and status; soft-deletes and refreshes the row. |
| `Set future absence` | Future-absence permission | Opens the future absence form; future date is required. |
| `Export` | Export permission | Downloads the current filtered result; button shows progress and a retry state. |
| `Print` | Print permission | Opens a print-safe route in a new tab with a server-generated report snapshot. |
| `Add` | Create permission | Navigates to the create form. |
| `Cancel` / breadcrumb | Always | Returns to the previous logical list without submitting dirty form data; dirty forms ask for confirmation. |
| `Save configuration` | Configuration edit permission | Validates dates, uniqueness, sessions, and dependent fields; saves then returns to list. |
| `Delete configuration` | Configuration delete permission | Requires confirmation and is disabled when recorded attendance depends on it unless an explicit archive flow exists. |

### 3.4 Attendance grid behavior

Each student row displays configured identity fields, admission/roll information, current status, reason, comment, and optional notification checkbox. Status options come from active attendance codes; do not hardcode only `Present` and `Absent`.

- Keyboard flow: status select, reason, comment, next row; focus returns to the first failed field after validation.
- Search filters visible rows only and never changes the submitted population.
- Virtualize large classes but keep a stable row identity and dirty-state map.
- A row marked absent can require a reason according to configuration; comments remain optional unless configured otherwise.
- Existing values are visually distinct from unrecorded values, and `Not recorded` is not treated as absent.
- Locked rows are read-only with a lock explanation and the lock source/date.
- After save, display `Saved by`, timestamp, and status version; stale-save conflicts offer `Reload server value` or `Keep my edit` where policy permits.

---

## 4. Screen-by-Screen Functional Specifications

### 4.1 Dashboard and daily overview

The dashboard loads today's totals, incomplete sections, absent count, recent history, and permitted quick actions. Cards are links, not decorative counters. A card with zero results remains visible with an empty state.

Daily overview behavior is based on the legacy `attendance.php` flow: select date and, where permitted, staff; show roll groups/classes, 10-school-day history, and today's taken/not-taken/not-timetabled status. Clicking a history cell navigates to marking that date. `Take attendance` routes to section, class, or timetable marking based on the row context.

### 4.2 Section/session marking

Load the selected roster and session configuration. For each row, initialize the saved status or the configured default. The user can set individual status, reason, comment, and notification choice, use `Set all`, copy to other sessions when allowed, and save.

Before save, show a review summary: total students, present, absent, other codes, unchanged rows, and notification recipients. The server rechecks school day, lock, roster membership, configuration, and permission. A successful save refreshes the values and history strip.

### 4.3 Student marking and edit history

The student flow selects academic year, program, class, section, student, date, and session. It shows the current record, available codes, reason/comment controls, and recent attendance history. Save is an upsert. Edit and delete actions are available only from permitted contexts and must show a confirmation for delete.

The history table includes date, status/code, context, subject/session, reason, comment, recorded by, recorded time, and actions. Parent/student views omit edit/delete and staff-only metadata.

### 4.4 Timetable and subject marking

The timetable grid displays periods as columns and subjects/classes as cells. A cell is clickable only when the user can mark that class and the date is editable. Already recorded cells show status and recorded time. Clicking a cell opens the same grid editor scoped to period/subject; saving returns to the timetable with the cell refreshed.

### 4.5 Future absence and self-registration

Future absence supports multi-selection of classes, sections, and students (single or multiple students across one or more classes and sections with batch scheduling), full-day or partial absence, future date, code/reason/comment, and a review step. It must prevent duplicate future records and show existing future absences before save.

Self-registration displays the current user, date, permitted status/action, network eligibility, and a single clear action. It must not expose roster data. On success, show the recorded timestamp and disable duplicate submission.

### 4.6 Reports and exports

Every report follows the same sequence: choose filters, apply, view paginated results, inspect details, export/print. Filter values remain in the URL and are included in export requests. Date ranges are normalized and limited to the active academic year unless an authorized cross-year permission exists.

Required report columns and interactions:

- Daily: class/section, recent history, today taken state, totals, and mark/view action.
- Monthly: student, program/class/section, present, absent, other codes, total school days, percentage, and student-history link.
- Section summary: date/session matrix with taken/not-taken state and section drill-down.
- Subject summary: subject, sessions, present, absent, percentage, and student drill-down.
- Students not present: program, class, section, student, session, reason, comment, and mark/history links.
- Not taken: missing date/session/section plus direct marking action.

### 4.7 Configuration and blocked dates

Configuration forms include academic year, program, one or more classes, attendance type (session, subject, both), lock range, auto-lock, SMS enablement/template/recipients, mandatory subject flag, display fields, sorting fields, and session number/name rows. Session rows can be added/removed client-side but are validated server-side for unique positive numbers and names.

Changing program reloads class options. Changing attendance type shows only relevant subject/session controls. Save is disabled while required dependent data is loading. The edit screen warns when the configuration already has attendance records.

Blocked-date screens support add/edit/delete and display the block reason wherever a date picker is used. Deleting a block requires explicit confirmation and revalidates whether attendance already exists.

---

## 5. Loading, Error, Accessibility, and Responsive Requirements

- Use skeletons for filters/results, inline errors for fields, and a page-level error boundary for unexpected failures.
- Preserve entered grid data during transient network errors and offer retry without clearing it.
- Announce save results and validation failures through an `aria-live` region.
- Every icon-only action has an accessible label and tooltip; every table action is keyboard reachable.
- Do not rely on color alone for present/absent/locked/not-recorded states.
- On mobile, filters collapse into a sheet, the student identity columns stay sticky, and row editing becomes a stacked form. Never place a wide attendance table in an inaccessible horizontal-only layout without an alternative row editor.
- Use locale-aware dates in the UI and ISO dates in URLs/API payloads.

---

## 6. Frontend Build Phases and Done Criteria

| Phase | Deliverable | Done when |
|---|---|---|
| F1 | Route shell, permissions, shared filters | All routes resolve, unauthorized routes return the standard access page, and query state survives refresh. |
| F2 | Dashboard, daily overview, section marking | A permitted staff user can load a roster, edit rows, save, reload, and see the result in daily history. |
| F3 | Student, timetable, secondary-section, future absence | Each flow preserves context and has focused success/error/conflict states. |
| F4 | Self-registration, parent/student history | Scope is enforced for each identity and edit actions are absent where required. |
| F5 | Reports, export, print | Every report supports filters, pagination, empty/error states, and permission-gated export/print. |
| F6 | Configuration, templates, blocked dates | Full CRUD and dependent controls work for the active school year with audit history. |
| F7 | Hardening | Keyboard, mobile, accessibility, stale-save, duplicate-submit, and large-roster checks pass. |

### Acceptance scenarios

1. Teacher opens Attendance, sees only assigned sections, marks a mixed class, saves, refreshes, and sees the exact statuses/reasons/comments.
2. Teacher attempts tomorrow, a closed date, and a locked date; each is rejected with a distinct explanation and no database change.
3. Admin configures three sessions, marks one session, copies to another permitted session, and verifies separate records.
4. A stale browser tab cannot overwrite newer attendance without a conflict response.
5. Parent can view an authorized child but cannot alter records or access another child by changing the URL.
6. Report filters remain intact through pagination, drill-down, export, and browser Back.
7. Notification failure leaves attendance saved and exposes a retryable notification result.
