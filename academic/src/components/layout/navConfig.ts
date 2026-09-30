// Matches the production Academics dropdown (Curriculum / Test menus) exactly —
// do not add/reorder items here on your own judgement; if the real menu changes,
// update this file to mirror it, not the other way round.

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const academicNavGroups: NavGroup[] = [
  {
    title: "Curriculum",
    items: [
      { label: "Subject Type", href: "/academics/subjects/subject-types" },
      { label: "Subject Master", href: "/academics/subjects" },
      { label: "Skill Master", href: "/academics/skills" },
      { label: "Curriculum Configuration", href: "/academics/curriculum" },
      { label: "Manage Elective Group", href: "/academics/electives/groups" },
      { label: "Remarks Master", href: "/academics/remarks" },
      { label: "DI Mode", href: "/academics/di-modes" },
      { label: "Grading System", href: "/academics/grade-systems" },
      { label: "Manage Test Room", href: "/academics/exam-rooms" },
      { label: "Reports Template", href: "/academics/report-templates" },
    ],
  },
  {
    title: "Test",
    items: [
      { label: "Test Home", href: "/academics/tests/masters" },
      { label: "Edit Test", href: "/academics/tests/instances" },
      { label: "Manage Test", href: "/academics/tests/bulk-update" },
      { label: "Marks Entry by Subject", href: "/academics/marks/by-subject" },
      { label: "Marks Entry by Student", href: "/academics/marks/by-student" },
      { label: "Enter A.A.T", href: "/academics/electives/aat" },
      { label: "Marks Upload", href: "/academics/tests/marks-upload" },
      { label: "Marks not Entered", href: "/academics/marks/not-entered" },
      { label: "Test Results", href: "/academics/results" },
      { label: "Sketch", href: "/academics/sketches" },
      { label: "Consolidate Report", href: "/academics/reports/consolidate" },
      { label: "Student Template Assign", href: "/academics/student-template-assign" },
    ],
  },
];
