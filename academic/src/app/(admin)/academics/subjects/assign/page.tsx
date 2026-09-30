"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import Button from "@/components/ui/Button";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { assignedSubjectStore, departmentStore } from "@/lib/mock/academics/stores";
import { academicYears, nextId, programs, yearGroups } from "@/lib/mock/academics/lookups";
import { AssignedSubjectToClass } from "@/types/academics";
import { useToast } from "@/components/ui/Toast";

const tabs: AssignedSubjectToClass["kind"][] = ["Core", "2nd Language", "3rd Language"];

export default function AssignSubjectsToClassPage() {
  const [tab, setTab] = useState<AssignedSubjectToClass["kind"]>("Core");
  const assignments = useListStore(assignedSubjectStore);
  const departments = useListStore(departmentStore);
  const { toast } = useToast();

  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);
  const [subjectIds, setSubjectIds] = useState<number[]>([]);

  const rows = assignments.filter((a) => a.kind === tab);

  function handleSubmit() {
    if (!programId || !yearGroupId || subjectIds.length === 0) {
      toast("Select a Program, Class and at least one Subject.", "error");
      return;
    }
    subjectIds.forEach((departmentId) => {
      assignedSubjectStore.add({
        id: nextId(),
        kind: tab,
        academicYearId: academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0].id,
        programId,
        yearGroupId,
        departmentId,
      });
    });
    toast(`${subjectIds.length} subject(s) assigned.`, "success");
    setSubjectIds([]);
  }

  return (
    <AcademicListPage
      title="Assign Subjects to Class"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Subjects", href: "/academics/subjects" },
        { label: "Assign to Class" },
      ]}
    >
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            Assign {t} Subjects to Class
          </button>
        ))}
      </div>

      <div className="card card-pad mt-16">
        <div className="section-title">New Assignment</div>
        <div className="field-row">
          <CascadingClassPicker
            programId={programId}
            yearGroupId={yearGroupId}
            onChange={(next) => {
              setProgramId(next.programId);
              setYearGroupId(next.yearGroupId);
            }}
            showSection={false}
          />
        </div>
        <div className="field">
          <label>Subjects</label>
          <div className="multiselect">
            {departments.map((d) => (
              <label key={d.id}>
                <input
                  type="checkbox"
                  checked={subjectIds.includes(d.id)}
                  onChange={(e) =>
                    setSubjectIds((prev) => (e.target.checked ? [...prev, d.id] : prev.filter((id) => id !== d.id)))
                  }
                />
                {d.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <h2>{tab} Assignments</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Program</th>
                <th>Class</th>
                <th>Subject</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{academicYears.find((y) => y.id === r.academicYearId)?.name}</td>
                  <td>{programs.find((p) => p.id === r.programId)?.name}</td>
                  <td>{yearGroups.find((y) => y.id === r.yearGroupId)?.name}</td>
                  <td>{departments.find((d) => d.id === r.departmentId)?.name}</td>
                  <td>
                    <div className="row-actions">
                      <DeleteConfirmButton
                        itemLabel="this assignment"
                        onConfirm={() => {
                          assignedSubjectStore.remove(r.id);
                          toast("Assignment removed.", "success");
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No {tab.toLowerCase()} subject assignments yet.</div>
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
