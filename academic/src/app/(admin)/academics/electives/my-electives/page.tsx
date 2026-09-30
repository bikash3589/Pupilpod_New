"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import { useListStore } from "@/lib/mock/createListStore";
import { departmentStore, electiveGroupStore } from "@/lib/mock/academics/stores";
import { students } from "@/lib/mock/academics/lookups";

const coreSubjectIds = [1, 2, 3];
const teacherNames: Record<number, string> = { 1: "Mrs. Kapoor", 2: "Mr. Sen", 3: "Ms. Fernandes", 4: "Mr. Rao", 6: "Mrs. Bhat", 7: "Mr. Iyer" };

export default function MyElectivesPage() {
  const departments = useListStore(departmentStore);
  const electiveGroups = useListStore(electiveGroupStore);
  const [studentId, setStudentId] = useState(students[0].id);
  const [showTeacher, setShowTeacher] = useState(true);

  const student = students.find((s) => s.id === studentId)!;
  const applicableGroups = electiveGroups.filter((g) => g.yearGroupId === student.yearGroupId);

  return (
    <AcademicListPage
      title="My Electives"
      subtitle="Read-only curriculum view for students/parents."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Electives", href: "/academics/electives/groups" }, { label: "My Electives" }]}
    >
      <div className="filter-bar">
        <div className="filter-field">
          <label>Child</label>
          <select className="select" value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <label className="checkbox-row" style={{ marginBottom: 8 }}>
          <input type="checkbox" checked={showTeacher} onChange={(e) => setShowTeacher(e.target.checked)} />
          Show Teacher Column (setting)
        </label>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <h2>Core Subjects</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                {showTeacher && <th>Subject Teacher</th>}
              </tr>
            </thead>
            <tbody>
              {departments
                .filter((d) => coreSubjectIds.includes(d.id))
                .map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    {showTeacher && <td>{teacherNames[d.id] ?? "—"}</td>}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <h2>Elective Subjects</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Subject Name</th>
                {showTeacher && <th>Teacher</th>}
              </tr>
            </thead>
            <tbody>
              {applicableGroups.flatMap((g) =>
                g.departmentIds.map((depId) => {
                  const dept = departments.find((d) => d.id === depId);
                  if (!dept) return null;
                  return (
                    <tr key={`${g.id}-${depId}`}>
                      <td>{g.name}</td>
                      <td>{dept.name}</td>
                      {showTeacher && <td>{teacherNames[dept.id] ?? "—"}</td>}
                    </tr>
                  );
                })
              )}
              {applicableGroups.length === 0 && (
                <tr>
                  <td colSpan={showTeacher ? 3 : 2}>
                    <div className="empty-state">No elective groups configured for this class.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AcademicListPage>
  );
}
