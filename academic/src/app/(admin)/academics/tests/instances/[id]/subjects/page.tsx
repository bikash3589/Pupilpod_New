"use client";

import { use, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import ConfigureCogButton from "@/components/academics/buttons/ConfigureCogButton";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, examRoomStore, gradeSystemStore, skillStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function SubjectToTestPage(props: PageProps<"/academics/tests/instances/[id]/subjects">) {
  const { id } = use(props.params);
  const testId = Number(id);

  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore).filter((s) => s.testId === testId);
  const departments = useListStore(departmentStore);
  const rooms = useListStore(examRoomStore);
  const gradeSystems = useListStore(gradeSystemStore);
  const skills = useListStore(skillStore);
  const { toast } = useToast();

  const test = tests.find((t) => t.id === testId);
  const assignedIds = new Set(subjectToTest.map((s) => s.departmentId));
  const availableSubjects = departments.filter((d) => !assignedIds.has(d.id));

  const [addSubjectId, setAddSubjectId] = useState<number | "">("");

  function addSubject() {
    if (!addSubjectId) return;
    subjectToTestStore.add({
      id: nextId(),
      testId,
      departmentId: addSubjectId,
      isTested: true,
      assessmentMethod: test?.assessmentMethod ?? "Marks",
      maxMarks: test?.maxMarks,
      minMarks: test?.minMarks,
      enableRemarks: test?.enableRemarks ?? false,
      gradeSystemId: test?.gradeSystemId,
      aat: false,
      skillConfig: [],
    });
    setAddSubjectId("");
    toast("Subject added to test.", "success");
  }

  return (
    <AcademicListPage
      title={`Subject Configuration — ${test?.name ?? ""}`}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Instances", href: "/academics/tests/instances" },
        { label: "Subjects" },
      ]}
      actions={
        <>
          <select className="select" value={addSubjectId} onChange={(e) => setAddSubjectId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Add subject…</option>
            {availableSubjects.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <Button variant="primary" size="sm" onClick={addSubject} disabled={!addSubjectId}>
            Add
          </Button>
        </>
      }
    >
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Tested</th>
                <th>Max/Min</th>
                <th>Grade System</th>
                <th>Room</th>
                <th>AAT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjectToTest.map((s) => {
                const dept = departments.find((d) => d.id === s.departmentId);
                return (
                  <tr key={s.id}>
                    <td>{dept?.name}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={s.isTested}
                        onChange={(e) => subjectToTestStore.update(s.id, { isTested: e.target.checked })}
                      />
                    </td>
                    <td>
                      {s.maxMarks ?? "—"} / {s.minMarks ?? "—"}
                    </td>
                    <td>{gradeSystems.find((g) => g.id === s.gradeSystemId)?.name ?? "—"}</td>
                    <td>
                      <select className="select" style={{ width: 130 }} value={s.roomId ?? ""} onChange={(e) => subjectToTestStore.update(s.id, { roomId: e.target.value ? Number(e.target.value) : undefined })}>
                        <option value="">None</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="checkbox" checked={s.aat} onChange={(e) => subjectToTestStore.update(s.id, { aat: e.target.checked })} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <ConfigureCogButton title={`Skill Weighting — ${dept?.name}`} label="Skills">
                          <div>
                            {skills.map((sk) => {
                              const cfg = s.skillConfig.find((c) => c.skillId === sk.id);
                              return (
                                <div key={sk.id} className="field-row" style={{ alignItems: "flex-end" }}>
                                  <div className="field">
                                    <label className="checkbox-row">
                                      <input
                                        type="checkbox"
                                        checked={!!cfg}
                                        onChange={(e) => {
                                          const nextConfig = e.target.checked
                                            ? [...s.skillConfig, { id: nextId(), skillId: sk.id, weightageType: "Percentage" as const, weightage: 0 }]
                                            : s.skillConfig.filter((c) => c.skillId !== sk.id);
                                          subjectToTestStore.update(s.id, { skillConfig: nextConfig });
                                        }}
                                      />
                                      {sk.name}
                                    </label>
                                  </div>
                                  {cfg && (
                                    <>
                                      <div className="field">
                                        <label>Weightage Type</label>
                                        <select
                                          className="select"
                                          value={cfg.weightageType}
                                          onChange={(e) =>
                                            subjectToTestStore.update(s.id, {
                                              skillConfig: s.skillConfig.map((c) => (c.skillId === sk.id ? { ...c, weightageType: e.target.value as never } : c)),
                                            })
                                          }
                                        >
                                          <option value="None">None</option>
                                          <option value="Sum">Sum</option>
                                          <option value="Average">Average</option>
                                          <option value="Percentage">Percentage</option>
                                        </select>
                                      </div>
                                      <div className="field">
                                        <label>Weightage</label>
                                        <input
                                          className="input"
                                          type="number"
                                          value={cfg.weightage ?? 0}
                                          onChange={(e) =>
                                            subjectToTestStore.update(s.id, {
                                              skillConfig: s.skillConfig.map((c) => (c.skillId === sk.id ? { ...c, weightage: Number(e.target.value) } : c)),
                                            })
                                          }
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </ConfigureCogButton>
                        <DeleteConfirmButton
                          itemLabel={dept?.name ?? "this subject"}
                          onConfirm={() => {
                            subjectToTestStore.remove(s.id);
                            toast("Subject removed from test.", "success");
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {subjectToTest.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">No subjects configured for this test yet.</div>
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
