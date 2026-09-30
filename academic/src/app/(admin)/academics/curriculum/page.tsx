"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import CopyToDestinationModal from "@/components/academics/buttons/CopyToDestinationModal";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import { useListStore } from "@/lib/mock/createListStore";
import { curriculumStore, departmentStore, skillStore, subjectSkillMappingStore } from "@/lib/mock/academics/stores";
import { academicYears, nextId, programs, yearGroups } from "@/lib/mock/academics/lookups";
import { Department, DIMode, SubjectToClassCurriculum } from "@/types/academics";
import { useToast } from "@/components/ui/Toast";

interface Row {
  departmentId: number;
  checked: boolean;
  displayName: string;
  subjectType: "Core" | "Elective";
  diMode: DIMode;
  position: number;
}

interface Query {
  programId: number;
  yearGroupId: number;
}

const diModes: DIMode[] = [
  "FREE_FORM",
  "SUBJECT_WISE",
  "SUBJECT_WISE_NO_EDIT",
  "SUBJECT_GRADE_WISE",
  "SUBJECT_GRADE_WISE_AUTO",
  "NO_DI",
];

const emptyColumns = [
  { key: "subject", header: "Subject" },
  { key: "displayName", header: "Display Name" },
  { key: "code", header: "Code" },
  { key: "subjectType", header: "Subject Type" },
  { key: "diMode", header: "D.I. Mode" },
];

function computeInitialRows(departments: Department[], existing: SubjectToClassCurriculum[]): Row[] {
  const byDept = new Map(existing.map((e) => [e.departmentId, e]));
  const rows: Row[] = departments.map((d, i) => {
    const e = byDept.get(d.id);
    return {
      departmentId: d.id,
      checked: !!e,
      displayName: e?.subjectDisplayName ?? d.name,
      subjectType: e?.subjectType ?? "Core",
      diMode: e?.diMode ?? "FREE_FORM",
      position: e?.position ?? i,
    };
  });
  rows.sort((a, b) => a.position - b.position);
  return rows;
}

export default function CurriculumConfigurationPage() {
  const [academicYearId, setAcademicYearId] = useState<number | null>(
    academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0]?.id ?? null
  );
  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);
  const [query, setQuery] = useState<Query | null>(null);

  // Subscribed here (not inside SubjectGridEditor) so its localStorage-hydration
  // pass — which completes shortly after mount, not on the very first render —
  // is reflected in the key below and forces a fresh, correctly-initialized
  // SubjectGridEditor instead of one whose editable rows got lazily seeded from
  // the pre-hydration (empty) snapshot and then never noticed the real data.
  const curriculum = useListStore(curriculumStore);
  const existing = query ? curriculum.filter((c) => c.programId === query.programId && c.yearGroupId === query.yearGroupId) : [];

  function handleGo() {
    if (!programId || !yearGroupId) return;
    setQuery({ programId, yearGroupId });
  }

  const program = programs.find((p) => p.id === query?.programId);
  const yearGroup = yearGroups.find((y) => y.id === query?.yearGroupId);

  return (
    <AcademicListPage title="Subject To Class" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Subject To Class" }]}>
      <div className="filter-bar">
        <div className="filter-field">
          <label>
            Academic Year<span className="req">*</span>
          </label>
          <select
            className="select"
            value={academicYearId ?? ""}
            onChange={(e) => setAcademicYearId(e.target.value ? Number(e.target.value) : null)}
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>
        <CascadingClassPicker
          programId={programId}
          yearGroupId={yearGroupId}
          onChange={(next) => {
            setProgramId(next.programId);
            setYearGroupId(next.yearGroupId);
            setQuery(null);
          }}
          showSection={false}
          labels={{ program: "Program *", yearGroup: "Class *" }}
        />
        <Button
          variant="primary"
          onClick={handleGo}
          disabled={!programId || !yearGroupId}
          disabledReason="Select a Program and Class first."
        >
          Go
        </Button>
      </div>

      {query ? (
        <SubjectGridEditor
          key={`${query.programId}:${query.yearGroupId}:${JSON.stringify(existing)}`}
          programId={query.programId}
          yearGroupId={query.yearGroupId}
          sourceLabel={`${program?.name ?? ""} · ${yearGroup?.name ?? ""}`}
        />
      ) : (
        <DataTable
          rowKey={(d: Department) => d.id}
          rows={[]}
          headerActions={
            <Button variant="primary" size="sm" disabled>
              Subject Sorting
            </Button>
          }
          leadingHeader={<input type="checkbox" disabled />}
          renderLeading={() => null}
          columns={emptyColumns}
        />
      )}
    </AcademicListPage>
  );
}

function SubjectGridEditor({
  programId,
  yearGroupId,
  sourceLabel,
}: {
  programId: number;
  yearGroupId: number;
  sourceLabel: string;
}) {
  const departments = useListStore(departmentStore);
  const curriculum = useListStore(curriculumStore);
  const skills = useListStore(skillStore);
  const subjectSkillMappings = useListStore(subjectSkillMappingStore);
  const { toast } = useToast();

  const existing = curriculum.filter((c) => c.programId === programId && c.yearGroupId === yearGroupId);

  const [rows, setRows] = useState<Row[]>(() => computeInitialRows(departments, existing));
  const [sortMode, setSortMode] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  function patchRow(departmentId: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.departmentId === departmentId ? { ...r, ...patch } : r)));
  }

  function move(departmentId: number, dir: -1 | 1) {
    setRows((prev) => {
      const index = prev.findIndex((r) => r.departmentId === departmentId);
      const target = index + dir;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((r, i) => ({ ...r, position: i }));
    });
  }

  function handleSave() {
    curriculumStore.removeMany(existing.map((c) => c.id));
    rows
      .filter((r) => r.checked)
      .forEach((r, i) => {
        curriculumStore.add({
          id: nextId(),
          departmentId: r.departmentId,
          programId,
          yearGroupId,
          subjectDisplayName: r.displayName,
          subjectType: r.subjectType,
          diMode: r.diMode,
          position: i,
        });
      });
    toast("Curriculum saved.", "success");
  }

  function toggleSkillMapping(skillId: number, mapped: boolean) {
    if (!selectedDeptId) return;
    if (mapped) {
      const existingMapping = subjectSkillMappings.find((m) => m.departmentId === selectedDeptId && m.skillId === skillId);
      if (existingMapping) subjectSkillMappingStore.remove(existingMapping.id);
    } else {
      subjectSkillMappingStore.add({ id: nextId(), departmentId: selectedDeptId, skillId });
    }
  }

  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <>
      <div className="page-actions">
        <Button variant="primary" size="sm" onClick={() => setSortMode((s) => !s)}>
          {sortMode ? "Done Sorting" : "Subject Sorting"}
        </Button>
        <CopyToDestinationModal
          sourceLabel={sourceLabel}
          onCopy={(destination) => {
            curriculumStore
              .getSnapshot()
              .filter((c) => c.programId === destination.programId && c.yearGroupId === destination.yearGroupId)
              .forEach((c) => curriculumStore.remove(c.id));
            rows
              .filter((r) => r.checked)
              .forEach((r, i) => {
                curriculumStore.add({
                  id: nextId(),
                  departmentId: r.departmentId,
                  programId: destination.programId,
                  yearGroupId: destination.yearGroupId,
                  subjectDisplayName: r.displayName,
                  subjectType: r.subjectType,
                  diMode: r.diMode,
                  position: i,
                });
              });
          }}
        />
        <Button variant="primary" size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>

      <DataTable
        rowKey={(r) => r.departmentId}
        rows={rows}
        leadingHeader={<input type="checkbox" disabled />}
        renderLeading={(r) => (
          <input type="checkbox" checked={r.checked} onChange={(e) => patchRow(r.departmentId, { checked: e.target.checked })} />
        )}
        columns={[
          {
            key: "subject",
            header: "Subject",
            render: (r) => {
              const dept = departments.find((d) => d.id === r.departmentId)!;
              return (
                <div className="flex items-center gap-6">
                  {sortMode && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => move(r.departmentId, -1)}>
                        ↑
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => move(r.departmentId, 1)}>
                        ↓
                      </Button>
                    </>
                  )}
                  <button
                    className="btn-link"
                    onClick={() => setSelectedDeptId(r.departmentId === selectedDeptId ? null : r.departmentId)}
                  >
                    {dept.name}
                  </button>
                </div>
              );
            },
          },
          {
            key: "displayName",
            header: "Display Name",
            render: (r) => (
              <input
                className="input"
                value={r.displayName}
                onChange={(e) => patchRow(r.departmentId, { displayName: e.target.value })}
              />
            ),
          },
          {
            key: "code",
            header: "Code",
            render: (r) => departments.find((d) => d.id === r.departmentId)?.subjectCode ?? "—",
          },
          {
            key: "subjectType",
            header: "Subject Type",
            render: (r) => (
              <select
                className="select"
                value={r.subjectType}
                onChange={(e) => patchRow(r.departmentId, { subjectType: e.target.value as Row["subjectType"] })}
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
              </select>
            ),
          },
          {
            key: "diMode",
            header: "D.I. Mode",
            render: (r) => (
              <select className="select" value={r.diMode} onChange={(e) => patchRow(r.departmentId, { diMode: e.target.value as DIMode })}>
                {diModes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ),
          },
        ]}
      />

      <div className="card mt-16">
        <div className="card-header">
          <h2>Skill Mapping{selectedDept ? ` — ${selectedDept.name}` : ""}</h2>
        </div>
        {!selectedDept ? (
          <div className="empty-state">Click a Subject above to manage its mapped Skills.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Skill</th>
                  <th>Skill Display Name</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((sk) => {
                  const mapped = subjectSkillMappings.some((m) => m.departmentId === selectedDeptId && m.skillId === sk.id);
                  return (
                    <tr key={sk.id}>
                      <td>
                        <input type="checkbox" checked={mapped} onChange={() => toggleSkillMapping(sk.id, mapped)} />
                      </td>
                      <td>{sk.name}</td>
                      <td>
                        <input className="input" defaultValue={sk.name} />
                      </td>
                    </tr>
                  );
                })}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state">No skills defined yet.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="disabled-note" style={{ padding: "0 20px 16px" }}>
          The checkbox persists to Subject–Skill mapping. &quot;Skill Display Name&quot; is not backed by the current schema
          (see ACADEMIC_DATABASE_SCHEMA.md SubjectSkillMapping) and is not saved yet.
        </p>
      </div>
    </>
  );
}
