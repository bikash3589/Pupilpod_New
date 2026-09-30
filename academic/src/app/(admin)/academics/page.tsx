import Link from "next/link";
import { academicNavGroups } from "@/components/layout/navConfig";
import { initialDepartments } from "@/lib/mock/academics/subjects";
import { initialSkills, initialRemarks } from "@/lib/mock/academics/skillsRemarks";
import { initialGradeSystems } from "@/lib/mock/academics/gradeSystems";
import { initialElectiveGroups } from "@/lib/mock/academics/electives";
import { initialTests, initialTestMasters } from "@/lib/mock/academics/tests";
import { initialSketches } from "@/lib/mock/academics/sketches";

const stats = [
  { label: "Subjects", value: initialDepartments.length, href: "/academics/subjects" },
  { label: "Skills", value: initialSkills.length, href: "/academics/skills" },
  { label: "Remarks", value: initialRemarks.length, href: "/academics/remarks" },
  { label: "Grade Systems", value: initialGradeSystems.length, href: "/academics/grade-systems" },
  { label: "Elective Groups", value: initialElectiveGroups.length, href: "/academics/electives/groups" },
  { label: "Test Masters", value: initialTestMasters.length, href: "/academics/tests/masters" },
  { label: "Test Instances", value: initialTests.length, href: "/academics/tests/instances" },
  { label: "Report Sketches", value: initialSketches.length, href: "/academics/sketches" },
];

export default function AcademicsDashboardPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Academics Overview</div>
          <div className="page-subtitle">
            Subjects, curriculum, tests, marks entry, report cards and analysis — Phase A1 frontend.
          </div>
        </div>
      </div>

      <div className="grid-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card card-pad">
            <div className="text-muted text-sm">{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="mt-16" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {academicNavGroups.map((group) => (
          <div key={group.title} className="card card-pad">
            <div className="section-title">{group.title}</div>
            <ul className="flex flex-col gap-8">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="btn-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
