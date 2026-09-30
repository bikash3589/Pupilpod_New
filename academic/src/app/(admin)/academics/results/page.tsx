"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore, subjectToTestStore, marksStore, gradeBandStore } from "@/lib/mock/academics/stores";
import { studentsForRollGroup } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface Filters {
  programId: number | null;
  yearGroupId: number | null;
  rollGroupId: number | null;
  testId: number | null;
}

const emptyFilters: Filters = { programId: null, yearGroupId: null, rollGroupId: null, testId: null };

export default function TestResultsPage() {
  const tests = useListStore(testStore);
  const subjectToTest = useListStore(subjectToTestStore);
  const marks = useListStore(marksStore);
  const gradeBands = useListStore(gradeBandStore);
  const { toast } = useToast();

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const testOptions = tests.filter(
    (t) =>
      (!draft.programId || t.programId === draft.programId) &&
      (!draft.yearGroupId || t.yearGroupId === draft.yearGroupId) &&
      (!draft.rollGroupId || !t.rollGroupId || t.rollGroupId === draft.rollGroupId)
  );

  const canGo = !!draft.programId && !!draft.yearGroupId && !!draft.rollGroupId && !!draft.testId;

  function handleGo() {
    if (!canGo) return;
    setApplied(draft);
    setSelected(new Set());
  }

  const test = applied ? tests.find((t) => t.id === applied.testId) : undefined;
  const roster = applied ? studentsForRollGroup(applied.rollGroupId) : [];
  const subjects = applied ? subjectToTest.filter((s) => s.testId === applied.testId) : [];

  const rows = roster.map((s) => {
    const total = subjects.reduce((sum, subj) => {
      const entry = marks.find((m) => m.studentId === s.id && m.departmentId === subj.departmentId && m.testId === applied?.testId);
      return sum + (entry?.marksObtained ?? 0);
    }, 0);
    const maxTotal = subjects.reduce((sum, subj) => sum + (subj.maxMarks ?? 0), 0);
    const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 1000) / 10 : 0;
    const band = gradeBands.find((b) => b.gradeSystemId === test?.gradeSystemId && percentage >= b.lowerLimit && percentage <= b.upperLimit);
    return { student: s, total, maxTotal, percentage, band };
  });

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.student.id))));
  }

  function requireTest(): boolean {
    if (!applied || !test) {
      toast("Select Program, Class, Section and Test, then click Go first.", "error");
      return false;
    }
    return true;
  }
  function requireSelection(): boolean {
    if (!requireTest()) return false;
    if (selected.size === 0) {
      toast("Select at least one student first.", "error");
      return false;
    }
    return true;
  }

  function setTestFlag(flag: "lockMarksEntry" | "enablePdf" | "enableHtml" | "enableTestReport", value: boolean, label: string) {
    if (!requireTest() || !test) return;
    testStore.update(test.id, { [flag]: value });
    toast(label, "success");
  }

  const [smsMarks, setSmsMarks] = useState(true);
  const [emailMarks, setEmailMarks] = useState(true);

  return (
    <AcademicListPage title="Test Results" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Test Results" }]}>
      <div className="card card-pad">
        <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => setTestFlag("lockMarksEntry", true, "Marks entry locked.")}>
            Lock Marks Entry
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("lockMarksEntry", false, "Marks entry unlocked.")}>
            Unlock Marks Entry
          </Button>
          {applied && test ? (
            <Link href="/academics/marks/by-subject" className="btn btn-secondary">
              Mark Entry
            </Link>
          ) : (
            <Button variant="secondary" onClick={requireTest}>
              Mark Entry
            </Button>
          )}
          <Button variant="secondary" onClick={() => requireSelection() && toast(`SMS sent to ${selected.size} student(s).`, "success")}>
            Send SMS
          </Button>
          <Button variant="secondary" onClick={() => requireSelection() && toast(`Email sent to ${selected.size} student(s).`, "success")}>
            Send Email
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("enablePdf", true, "PDF report shown.")}>
            Show Pdf
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("enablePdf", false, "PDF report hidden.")}>
            Hide Pdf
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("enableHtml", true, "HTML report shown.")}>
            Show HTML
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("enableHtml", false, "HTML report hidden.")}>
            Hide HTML
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("enableTestReport", false, "Test report locked.")}>
            Lock T.R
          </Button>
          <Button variant="secondary" onClick={() => setTestFlag("enableTestReport", true, "Test report unlocked.")}>
            Unlock T.R
          </Button>
        </div>
        <div className="flex gap-8 mt-8" style={{ flexWrap: "wrap" }}>
          <Button
            variant={smsMarks ? "primary" : "secondary"}
            onClick={() => {
              setSmsMarks((v) => !v);
              toast(`Send Mark via SMS ${!smsMarks ? "enabled" : "disabled"}.`, "info");
            }}
          >
            Send Mark via SMS
          </Button>
          <Button
            variant={emailMarks ? "primary" : "secondary"}
            onClick={() => {
              setEmailMarks((v) => !v);
              toast(`Send Mark via Email ${!emailMarks ? "enabled" : "disabled"}.`, "info");
            }}
          >
            Send Mark via Email
          </Button>
          <Button variant="secondary" onClick={() => requireSelection() && toast(`Mass download started for ${selected.size} student(s).`, "success")}>
            Mass Download
          </Button>
        </div>

        <div className="flex items-center gap-12" style={{ margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--primary)" }}>SEARCH FILTER</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <div className="flex items-start gap-12" style={{ flexWrap: "wrap" }}>
          <CascadingClassPicker
            programId={draft.programId}
            yearGroupId={draft.yearGroupId}
            rollGroupId={draft.rollGroupId}
            onChange={(next) => setDraft({ ...draft, ...next, testId: null })}
            labels={{ program: "Program *", yearGroup: "Class *", rollGroup: "Section *" }}
          />
          <div className="filter-field">
            <label>
              Select Test<span className="req">*</span>
            </label>
            <select
              className="select"
              value={draft.testId ?? ""}
              disabled={!draft.programId || !draft.yearGroupId || !draft.rollGroupId}
              onChange={(e) => setDraft({ ...draft, testId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Select Test</option>
              {testOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={handleGo} disabled={!canGo} disabledReason="Select Program, Class, Section and Test first.">
            Go
          </Button>
        </div>
      </div>

      <div className="card mt-16">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" disabled={rows.length === 0} checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll} />
                </th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(r.student.id)} onChange={() => toggle(r.student.id)} />
                  </td>
                  <td>{r.student.admissionNo}</td>
                  <td>{r.student.name}</td>
                  <td>
                    {r.total} / {r.maxTotal}
                  </td>
                  <td>{r.percentage}%</td>
                  <td>
                    {r.band ? (
                      <span className={`badge ${r.band.subjectStatus === "Pass" ? "badge-success" : "badge-danger"}`}>{r.band.gradeName}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <Link href={`/academics/results/${applied?.testId}?studentId=${r.student.id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">There are no records to display.</div>
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
