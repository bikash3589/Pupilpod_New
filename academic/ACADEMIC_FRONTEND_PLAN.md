# Academic Module — Frontend Implementation Plan (Next.js)

**Source:** Extracted from `ACADEMIC_NEXTJS_IMPLEMENTATION_PLAN.md` Sections 5–12 (functionality/UI portions only — see `ACADEMIC_DATABASE_SCHEMA.md` for the Prisma models these screens read/write).
**Framework:** Next.js 14+ · App Router · TypeScript — same stack/repo as the Admission module.
**Status note:** The source plan was pasted mid-document and cut off partway through Section 12.1 (Elective Groups). Sections 13 (Report Cards / Sketches) and 14 (Analysis & Export Reports) are referenced by route in Section 5's folder map but their detailed screen-by-screen breakdown was not included in what was pasted — treat those two areas as **route stubs only** below until the rest of the plan is supplied.

---

## 1. Route Map

```
app/(admin)/academics/
  subjects/                              → Subjects Master (Section 4 below)
    [id]/edit/
    assign/                              → Assign Subjects to Class (Core/2nd/3rd Language tabs)
    subject-types/                       → Subject Types CRUD
  curriculum/
    [programId]/[classId]/               → Subject-to-Class curriculum grid + skill sub-panel
  skills/                                → Skills CRUD
    [id]/edit/
  remarks/                               → Remarks CRUD
    [id]/edit/
  grade-systems/                         → Grade Systems CRUD
    [id]/edit/
    [id]/configure/                      → Grade Bands CRUD
  electives/
    groups/                              → Elective Groups CRUD
    groups/[id]/edit/
    my-electives/                        → Student/parent read-only elective view
    aat/                                 → Additional Assessment Task (AAT) entry
  exam-rooms/                            → Exam Rooms CRUD
    [id]/edit/
  tests/
    masters/                             → Test Master list
    masters/[id]/edit/
    masters/[id]/create-tests/           → Class/section tree → generate per-class Test instances
    instances/                           → Test instance list (per class/section)
    instances/new/
    instances/[id]/edit/
    instances/[id]/subjects/             → Subject-to-Test configuration
    instances/copy/                      → Copy test to other sections
    bulk-update/[testMasterId]/          → Bulk toggle (lock/publish/show HTML|PDF) across tests
    publish-report/
    marks-upload/                        → CSV marks import
  marks/
    by-subject/
    by-subject-skill/
    by-student/                          → Roster → per-student entry
    by-student-result/
    not-entered/                         → Students with missing marks
  sketches/                              → Report-card "sketch" template config (route stub — see Section 8)
    [id]/edit/
    [id]/attributes/
    [id]/attributes/[attrId]/edit/
    [id]/templates/
    [id]/templates/[tplId]/configure-image/
    [id]/report-configs/
    [id]/generate/
  student-template-assign/
  report-templates/                      → Global report-template master (PDF uploads)
  results/                               → Student/parent result view (route stub — see Section 8)
    [testId]/
  reports/                               → Analysis & export reports (route stub — see Section 8)
    analysis/
    analysis-by-staff/
    analysis-on-subject/
    consolidate/
    previous-progress/

app/api/academics/
  subjects/, curriculum/, skills/, remarks/, grade-systems/, electives/, exam-rooms/
  tests/masters/, tests/instances/, tests/instances/[id]/subjects/
  marks/by-subject/, marks/by-student/, marks/history/
  sketches/, sketches/[id]/attributes/, sketches/[id]/generate/
  reports/analysis/, reports/consolidate/, reports/export/

lib/domain/academics/
  departmentGateway.ts, curriculumGateway.ts, skillGateway.ts, remarkGateway.ts,
  gradeSystemGateway.ts, electiveGateway.ts, testGateway.ts, marksGateway.ts,
  sketchGateway.ts, analysisReportGateway.ts

components/academics/
  buttons/  ConfigureCogButton.tsx  LockToggleButton.tsx  ImportExportButtons.tsx
  AcademicListPage.tsx        (shared list-page shell)
  CascadingClassPicker.tsx    (Program → Class → Section cascade)
  MarksGrid.tsx               (shared by all marks-entry variants)
  SketchAttributeForm.tsx     (category-branching form)
```

---

## 2. Shared Components ("Common Buttons" for Academics)

No shared button/grid-permission class exists in the legacy source for this module (unlike Admission's `AdmissionGrid`), so this rewrite introduces one set of shared pieces used everywhere instead of per-screen hand-rolled markup.

### 2.1 Build once, reuse everywhere

| Component | Behavior | Used by |
|---|---|---|
| `<AcademicListPage>` | Header (title + breadcrumb) + header-action button row + table body + row-action column | Every list screen in Sections 4–9 |
| `<CascadingClassPicker programId classId sectionId onChange>` | Program → Class → Section three-select cascade, backed by one `/api/academics/lookups/classes` + `/sections` pair | Curriculum, Assign Subjects, Marks Entry (all variants), Test Marks Upload, Elective Groups, Analysis/Consolidate reports |
| `<DeleteConfirmButton>` | Confirm-then-delete | Skills, Remarks, Grade Systems, Grade Bands, Elective Groups, Subject Types, Exam Rooms, Test Masters, Report Templates |
| `<ExportExcelButton tableRef filename>` | Client-side table export, no server round trip | Every report/list screen with an Export action |

### 2.2 Same shape, per-screen logic varies

| Component | Variation |
|---|---|
| **Add** (`visible`/`disabled` props) | Unconditional on Skills/Remarks/Grade Systems/Exam Rooms; disabled until a Class is chosen on Elective Groups; inline reveal (not navigation) on Sketch Attributes |
| `<ConfigureCogButton onOpen>` | Same gear icon, three different modal contents: Sketch list rows → attribute config; Subject-to-Test rows → skill weighting; Sketch Template rows → image field placement |
| `<LockToggleButton field value onToggle>` | Parameterized by field name — replaces ten bespoke icon toggles on the Test bulk-update screen (lock/unlock, publish/unpublish, show/hide HTML or PDF) |
| `<BulkActionsBar selectedIds>` | Bulk Delete / Bulk Export with identical confirm+toast pattern — Skills, Exam Rooms, Subjects |
| `<SaveMarksButton disabledReason>` | Disabled when the test is lock-marks-entry, or when a required skill hasn't been chosen yet |
| `<CopyToDestinationModal sourceLabel onCopy>` | Source (read-only) → destination Academic Year/Program/Class cascade → Submit. Reused for: Test Master → next year, Subject assignment → other classes, Elective Group → other classes, Sketch → other years |

### 2.3 `<MarksGrid>` — one component, five call sites
`by-subject`, `by-subject-skill`, `by-student`, `by-student-result`, and `electives/aat` are the same grid concept: rows = students or subjects, columns = one block per test, cells = marks/grade/remark inputs sharing the same three-tier lock logic (see `ACADEMIC_DATABASE_SCHEMA.md` Section 1). Build one `<MarksGrid axis="student"|"subject" tests students lockedCells onSave>` component and thin page wrappers that select the axis + save endpoint.

### 2.4 Permission model
No per-button DB permission table exists in the legacy source (single per-file access check, no button-level granularity). Recommended: reuse the Admission module's `ModuleButtonPermission` pattern, add Academic module rows to the same table, and fetch once per page via `useModuleButtonPermissions("Academics")`. **Every route below must define its own, correctly-scoped permission key — do not reuse a sibling screen's key**, since several legacy files were found to check the wrong screen's permission node (copy-paste artifacts) and that bug must not be ported forward.

---

## 3. Recommended Build Order

`Subjects Master → Curriculum/Subject Assignment → Skills & Remarks → Grade System → Exam Rooms → Electives → Test Management → Marks Entry → Report Cards/Sketches → Analysis & Export`

(Subject/Department master data must exist before subject-assignment screens can be built against it.)

---

## 4. Subjects Master

**Route:** `/academics/subjects`

| Screen | Route | Header actions | Row actions |
|---|---|---|---|
| Subjects list | `/academics/subjects` | Assign Subjects to Class → `/academics/subjects/assign` · Add Subject → `/academics/subjects/new` · Bulk Delete (checked rows) · Default Template (CSV download) · Import (CSV upload) · Export (client-side) | Edit, Delete (blocked server-side if the subject is referenced by a core-subject-to-class assignment) |
| Add/Edit Subject | `/academics/subjects/new`, `/academics/subjects/[id]/edit` | — | Save |

**List columns:** checkbox · Name · Type · Subject Code. **Filters:** Type, Name text search.

**Add/Edit fields:**
- Type — select: Learning Area / Administration / Scholastic / Co-Scholastic / Part A / Part B
- Name (required)
- Subject Code
- Sections — multi-select
- Read/Write/Memory Min/Medium/Max — **conditional**, shown only when a per-school feature flag (`showReadWriteMemoryFields`) is enabled — this replaces a hardcoded tenant-domain check in the legacy source and must be a real setting, not an `if (tenant === 'x')`
- Role (Coordinator/Director) — conditional on Type

**Import modal:** CSV upload mapping "Subject Type" / "Subject Name" / "Subject Code" columns. Must use parameterized inserts on the API side (the legacy equivalent built raw SQL via string concatenation — do not carry that pattern forward).

---

## 5. Subject & Curriculum

### 5.1 Curriculum / Subject-to-Class
**Route:** `/academics/curriculum/[programId]/[classId]`

This is the richest screen in the module — an inline-editable subject grid plus a skill sub-panel.

- **Filters:** Academic Year, Program, Class — `<CascadingClassPicker>`
- **Subject grid columns:** checkbox · Subject (click → reveals skill sub-table) · Display Name (editable text) · Code · Subject Type (inline select: Core/Elective) · D.I. Mode (inline select: FREE_FORM / SUBJECT_WISE / SUBJECT_WISE_NO_EDIT / SUBJECT_GRADE_WISE / SUBJECT_GRADE_WISE_AUTO / NO_DI)
- **Buttons:**
  - `Subject Sorting` — opens a drag-sort panel, persists position order
  - `Go` — filter submit
  - `Copy` — visible only once a Program is selected → `<CopyToDestinationModal>`
  - `Save` — same visibility guard as Copy; persists checked subjects + inline-edited fields (delete unchecked, upsert checked)
- **Skill sub-panel:** checkbox · Skill · Skill Display Name · Skill Display Order — population source unconfirmed in the legacy source; verify against a running instance before finalizing this panel's data binding.

### 5.2 Assign Subjects to Class
**Route:** `/academics/subjects/assign`

Legacy source had three near-identical screens (Core / 2nd Language / 3rd Language), differing only in which assignment table they wrote to. **Build one page with a tab switcher** (`Core` / `2nd Language` / `3rd Language`) instead of three separate pages.

- **Grid columns:** Academic Year (readonly) · Program · Class · Subject — row action `Delete`
- **Form fields:** Program (select) → Class (multi-select, cascade) → Subjects (multi-select, cascade) → `Submit`
- Use a maintained multiselect component (the legacy bootstrap-multiselect control loaded from a dead CDN URL — treat as already broken, don't replicate).

### 5.3 Subject Types
**Route:** `/academics/subjects/subject-types`

Simple CRUD: list (SI No, Name) → Add/Edit (Name, required, unique) → Delete (confirm).

### 5.4 Bulk-assign subjects to selected students
**Route:** `/academics/students/assign-subjects` (data-owned by Academics, but surfaced under Students nav)

Operates on a pre-selected student set (pass as query param / selection state, not session state). One checkbox per subject → `Assign`.

### 5.5 Curriculum report (read-only, student/parent-facing)
**Route:** reuses the parent/student portal shell built for Admission.

Two static tables: "Core Subject" (Subject Name, Subject Teacher) and "Elective Subject" (Group Name, Subject Name, Teacher) — teacher-name column visibility gated by a setting. Parent with multiple children gets a child switcher. No admin actions — pure view.

---

## 6. Skills & Remarks

### 6.1 Skills
**Route:** `/academics/skills`

| Element | Detail |
|---|---|
| Columns | checkbox · SI No · Name · Code · Description |
| Header buttons | Add (modal) · Bulk Delete (confirm + toast) · Default Template (CSV) · Import → `/academics/skills/import` · Export (checked rows only) |
| Row actions | Edit, Delete — **guard:** blocked with "This Skill has been mapped to a Subject." if referenced by a subject-skill mapping |
| Add/Edit fields | Name (required), Code (required, unique across name+code), Description (textarea) |

### 6.2 Remarks
**Route:** `/academics/remarks`

| Element | Detail |
|---|---|
| Columns | Code · Description · Subject (joined name) · Skill (joined name) |
| Header buttons | Add |
| Row actions | Edit, Delete (hard delete, no guard) |
| Add fields | Remark Code (required), Description (required), Subjects (multi-select — **Add creates one row per selected subject**, replicate this fan-out in the API route), Skill (single select) |
| Edit fields | Same 4 fields but single-subject only in the legacy source (an inconsistency vs. Add) — **recommendation: support multi-subject on Edit too**, for consistency |

---

## 7. Grade System

**Routes:** `/academics/grade-systems`, `/academics/grade-systems/[id]/configure`

### 7.1 Grade Systems list
Columns: Sl No · Name · Code. Header: Add (modal). Row actions: Edit, Delete, `Grade Configure` (gear icon) → `/academics/grade-systems/[id]/configure`.

### 7.2 Add/Edit Grade System
Fields: Name (required, max 40), Code (required, max 30).

### 7.3 Grade Bands
Columns: Grade Name · Grade Point · Lower Limit · Upper Limit · Rank · Class Obtained · Status · Description. Header: Add → `/academics/grade-systems/[id]/configure/new`. Also a `Pass/Fail Condition` radio (Marks vs Grade) — verify wiring against a running instance, unconfirmed in source.

### 7.4 Add/Edit Grade Band
Fields: Grade Name (required), Grade Point (required, numeric), Lower Limit (required, numeric), Upper Limit (required, numeric — **must validate ≥ Lower Limit**, implement as a Zod refinement rather than a second hidden button as the legacy JS did), Rank, Subject Status (Pass/Fail radio), Class Obtained (select: Distinction/First Class/Second Class/Poor), Description (textarea), Image upload (.jpg/.jpeg/.gif/.png), Grade Unique No.

### 7.5 Grade recompute — do not port batch scripts as-is
Legacy grade-recompute scripts have no confirmed live caller. **Recommendation:** implement grade recomputation as a server action triggered automatically whenever a grade-band configuration changes for a system in active use, rather than porting any standalone batch script.

---

## 8. Examination Administration (Rooms)

**Route:** `/academics/exam-rooms`

Columns: checkbox · SI No · Name · Code. Header: Add (modal) · Bulk Delete (confirm) · Default Template (CSV) · Import · Export (guard: must select ≥1 row, else error toast "You Have to Select Room."). Row actions: Edit, Delete. Add/Edit fields: Name (required), Code (required) — uniqueness checked on both fields together.

---

## 9. Electives (partial — source plan truncated here)

**Routes:** `/academics/electives/groups`, `/academics/electives/groups/[id]/edit`, `/academics/electives/my-electives`, `/academics/electives/aat`

### 9.1 Elective Groups (admin)
List/CRUD screen for elective groups (name, order, min/max selection, academic year, program, year group, section(s), member subjects). **Buttons known from Section 5's route map and Section 2.2's shared-component table:**
- Add — disabled until a Class is selected
- Copy → `<CopyToDestinationModal>` (copy an elective group's config to another class)
- Delete → `<DeleteConfirmButton>`

Two picker popups (`section_specify`, `subject_specify` in the legacy source) support this screen's Section/Subject selection — implement as modals, not separate pages.

### 9.2 My Electives (student/parent, read-only)
**Route:** `/academics/electives/my-electives` — reuses the parent/student portal shell. No admin actions.

### 9.3 AAT (Additional Assessment Task) entry
**Route:** `/academics/electives/aat` — one of the five `<MarksGrid>` call sites (Section 2.3).

> **Everything past this point in Section 12 of the source plan (remaining Elective Group screens, Section 13 Report Cards/Sketches detail, Section 14 Analysis & Export detail) was not included in what was pasted.** The route stubs in Section 1's folder map above are carried forward as placeholders; request the remainder of the plan before building those screens in detail.

---

## 10. Test Management (routes only — carried from Section 1 folder map)

| Route | Legacy screen concept |
|---|---|
| `tests/masters` | Test Master list |
| `tests/masters/[id]/create-tests` | Class/section tree → generate per-class Test instances |
| `tests/instances` | Per-class/section Test instance list |
| `tests/instances/[id]/subjects` | Subject-to-Test configuration (assessment method, max/min marks, room, invigilator, AAT) |
| `tests/bulk-update/[testMasterId]` | Bulk toggle: lock/unlock, publish/unpublish, show/hide HTML or PDF — via `<LockToggleButton>` |
| `tests/publish-report` | Publish test report |
| `tests/marks-upload` | CSV marks import |

## 11. Marks Entry (routes only)

All five screens below share `<MarksGrid>` (Section 2.3): `marks/by-subject`, `marks/by-subject-skill`, `marks/by-student` (roster → entry), `marks/by-student-result`, `marks/not-entered` (students with missing marks — read-only list, no grid).

---

## 12. Testing Checklist Before Marking a Screen Done

- [ ] Route wired with its own correctly-scoped permission key (never copied from a sibling screen)
- [ ] List screen uses `<AcademicListPage>` — no hand-rolled table markup
- [ ] Any Program/Class/Section selector uses `<CascadingClassPicker>` — no screen-local AJAX cascade
- [ ] Any per-school conditional field/logic is backed by a real settings flag, not a domain-string or role-ID check
- [ ] Delete actions that have a referential guard in the legacy source (Skills, Subjects) reproduce that guard
- [ ] Marks-entry screens respect the three-tier lock (test-level, per-student, per-entry) end-to-end
