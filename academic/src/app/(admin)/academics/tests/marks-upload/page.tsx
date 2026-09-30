"use client";

import { useMemo, useRef, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, departmentStore, skillStore, marksStore } from "@/lib/mock/academics/stores";
import { rollGroupsForYearGroup, studentsForRollGroup, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface Combo {
  key: string;
  testId: number;
  departmentId: number;
  skillId: number | null;
  testName: string;
  subjectName: string;
  skillName: string;
}

function comboColumnLabel(c: Combo) {
  return c.skillId ? `${c.testName} - ${c.subjectName} - ${c.skillName}` : `${c.testName} - ${c.subjectName}`;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function MarksUploadPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const departments = useListStore(departmentStore);
  const skills = useListStore(skillStore);
  const { toast } = useToast();

  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);

  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);
  const [testSearch, setTestSearch] = useState("");
  const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
  const [comboSearch, setComboSearch] = useState("");
  const [selectedComboKeys, setSelectedComboKeys] = useState<string[]>([]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadRows, setUploadRows] = useState<Record<string, string>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sectionOptions = rollGroupsForYearGroup(yearGroupId);

  const testOptions = useMemo(() => {
    const inScope = tests.filter(
      (t) =>
        (!programId || t.programId === programId) &&
        (!yearGroupId || t.yearGroupId === yearGroupId) &&
        (selectedSectionIds.length === 0 || !t.rollGroupId || selectedSectionIds.includes(t.rollGroupId))
    );
    const q = testSearch.trim().toLowerCase();
    return q ? inScope.filter((t) => t.name.toLowerCase().includes(q)) : inScope;
  }, [tests, programId, yearGroupId, selectedSectionIds, testSearch]);

  const combos = useMemo(() => {
    const list: Combo[] = [];
    selectedTestIds.forEach((testId) => {
      const test = tests.find((t) => t.id === testId);
      subjectToTest
        .filter((s) => s.testId === testId)
        .forEach((s) => {
          const subjectName = departments.find((d) => d.id === s.departmentId)?.name ?? "Subject";
          if (s.skillConfig.length === 0) {
            list.push({ key: `${testId}:${s.departmentId}:0`, testId, departmentId: s.departmentId, skillId: null, testName: test?.name ?? "", subjectName, skillName: "—" });
          } else {
            s.skillConfig.forEach((sk) => {
              const skillName = skills.find((x) => x.id === sk.skillId)?.name ?? "Skill";
              list.push({ key: `${testId}:${s.departmentId}:${sk.skillId}`, testId, departmentId: s.departmentId, skillId: sk.skillId, testName: test?.name ?? "", subjectName, skillName });
            });
          }
        });
    });
    const q = comboSearch.trim().toLowerCase();
    return q ? list.filter((c) => `${c.testName} ${c.subjectName} ${c.skillName}`.toLowerCase().includes(q)) : list;
  }, [selectedTestIds, tests, subjectToTest, departments, skills, comboSearch]);

  const selectedCombos = combos.filter((c) => selectedComboKeys.includes(c.key));
  const roster = selectedSectionIds.flatMap((id) => studentsForRollGroup(id));

  const canBuildTemplate = selectedSectionIds.length > 0 && selectedCombos.length > 0;

  function toggleAll<T>(all: T[], selected: T[], setSelected: (v: T[]) => void) {
    setSelected(selected.length === all.length ? [] : [...all]);
  }
  function toggleOne<T>(value: T, selected: T[], setSelected: (v: T[]) => void) {
    setSelected(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  function handleDownloadTemplate() {
    if (!canBuildTemplate) return;
    const headers = ["Admission No", "Student Name", ...selectedCombos.map(comboColumnLabel)];
    const lines = roster.map((s) => [s.admissionNo, s.name, ...selectedCombos.map(() => "")].join(","));
    downloadCsv("marks-upload-template.csv", [headers.join(","), ...lines].join("\r\n"));
    toast("Template downloaded.", "success");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => setUploadRows(parseCsv(text)));
  }

  function handleImport() {
    if (!canBuildTemplate) {
      toast("Select Section(s), Test(s) and at least one column first.", "error");
      return;
    }
    if (uploadRows.length === 0) {
      toast("Choose a CSV file matching the downloaded template.", "error");
      return;
    }
    let imported = 0;
    uploadRows.forEach((row) => {
      const student = roster.find((s) => s.admissionNo === row["Admission No"]);
      if (!student) return;
      selectedCombos.forEach((combo) => {
        const raw = row[comboColumnLabel(combo)];
        if (raw === undefined || raw === "") return;
        const marksVal = Number(raw);
        if (Number.isNaN(marksVal)) return;
        const existing = marksStore
          .getSnapshot()
          .find((m) => m.studentId === student.id && m.testId === combo.testId && m.departmentId === combo.departmentId && (combo.skillId == null || m.skillId === combo.skillId));
        if (existing) {
          marksStore.update(existing.id, { marksObtained: marksVal });
        } else {
          marksStore.add({
            id: nextId(),
            testId: combo.testId,
            studentId: student.id,
            departmentId: combo.departmentId,
            skillId: combo.skillId ?? undefined,
            marksObtained: marksVal,
            status: 0,
          });
        }
        imported += 1;
      });
    });
    toast(`${imported} mark(s) imported.`, "success");
    setUploadRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadModalOpen(false);
  }

  return (
    <AcademicListPage title="Upload Marks" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Upload Marks" }]}>
      <div className="card card-pad">
        <div className="section-title" style={{ border: "none", marginBottom: 14, paddingBottom: 0 }}>
          Test Mark Upload
        </div>

        <div className="flex gap-8 mt-8" style={{ marginBottom: 18 }}>
          <Button
            variant="primary"
            onClick={handleDownloadTemplate}
            disabled={!canBuildTemplate}
            disabledReason="Select Program, Class, at least one Section, Test and column first."
          >
            Download template(Test)
          </Button>
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            disabled={!canBuildTemplate}
            disabledReason="Select Program, Class, at least one Section, Test and column first."
          >
            Upload/Import Marks
          </Button>
        </div>

        <div className="flex items-start gap-12" style={{ flexWrap: "wrap", marginBottom: 18 }}>
          <CascadingClassPicker
            programId={programId}
            yearGroupId={yearGroupId}
            onChange={(next) => {
              setProgramId(next.programId);
              setYearGroupId(next.yearGroupId);
              setSelectedSectionIds([]);
              setSelectedTestIds([]);
              setSelectedComboKeys([]);
            }}
            showSection={false}
            labels={{ program: "Program *", yearGroup: "Class *" }}
          />
        </div>

        <div className="grid-3" style={{ alignItems: "start" }}>
          {/* ── Section ── */}
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        disabled={sectionOptions.length === 0}
                        checked={sectionOptions.length > 0 && selectedSectionIds.length === sectionOptions.length}
                        onChange={() => toggleAll(sectionOptions.map((r) => r.id), selectedSectionIds, setSelectedSectionIds)}
                      />
                    </th>
                    <th>Section</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionOptions.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input type="checkbox" checked={selectedSectionIds.includes(r.id)} onChange={() => toggleOne(r.id, selectedSectionIds, setSelectedSectionIds)} />
                      </td>
                      <td>{r.name}</td>
                    </tr>
                  ))}
                  {sectionOptions.length === 0 && (
                    <tr>
                      <td colSpan={2}>
                        <div className="empty-state">Select a Class first.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Test ── */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom: 0 }}>
              <input className="input" placeholder="Search…" value={testSearch} onChange={(e) => setTestSearch(e.target.value)} />
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        disabled={testOptions.length === 0}
                        checked={testOptions.length > 0 && testOptions.every((t) => selectedTestIds.includes(t.id))}
                        onChange={() => {
                          const ids = testOptions.map((t) => t.id);
                          const allSelected = ids.every((id) => selectedTestIds.includes(id));
                          setSelectedTestIds(allSelected ? selectedTestIds.filter((id) => !ids.includes(id)) : [...new Set([...selectedTestIds, ...ids])]);
                          setSelectedComboKeys([]);
                        }}
                      />
                    </th>
                    <th>Test</th>
                  </tr>
                </thead>
                <tbody>
                  {testOptions.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedTestIds.includes(t.id)}
                          onChange={() => {
                            toggleOne(t.id, selectedTestIds, setSelectedTestIds);
                            setSelectedComboKeys([]);
                          }}
                        />
                      </td>
                      <td>{t.name}</td>
                    </tr>
                  ))}
                  {testOptions.length === 0 && (
                    <tr>
                      <td colSpan={2}>
                        <div className="empty-state">No tests for this selection.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Test Name / Subject / Skill ── */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom: 0 }}>
              <input className="input" placeholder="Search…" value={comboSearch} onChange={(e) => setComboSearch(e.target.value)} />
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        disabled={combos.length === 0}
                        checked={combos.length > 0 && combos.every((c) => selectedComboKeys.includes(c.key))}
                        onChange={() => toggleAll(combos.map((c) => c.key), selectedComboKeys, setSelectedComboKeys)}
                      />
                    </th>
                    <th>Test Name</th>
                    <th>Subject</th>
                    <th>Skill</th>
                  </tr>
                </thead>
                <tbody>
                  {combos.map((c) => (
                    <tr key={c.key}>
                      <td>
                        <input type="checkbox" checked={selectedComboKeys.includes(c.key)} onChange={() => toggleOne(c.key, selectedComboKeys, setSelectedComboKeys)} />
                      </td>
                      <td>{c.testName}</td>
                      <td>{c.subjectName}</td>
                      <td>{c.skillName}</td>
                    </tr>
                  ))}
                  {combos.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">Select at least one Test.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal open={uploadModalOpen} title="Upload / Import Marks" onClose={() => setUploadModalOpen(false)}>
        <p className="text-sm text-muted">
          Upload a CSV matching the downloaded template — Admission No, Student Name, then one column per selected Test/Subject/Skill.
        </p>
        <div className="field mt-12">
          <label>CSV file</label>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} />
        </div>
        {uploadRows.length > 0 && <p className="text-sm">{uploadRows.length} row(s) parsed.</p>}
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport}>
            Import
          </Button>
        </div>
      </Modal>
    </AcademicListPage>
  );
}
