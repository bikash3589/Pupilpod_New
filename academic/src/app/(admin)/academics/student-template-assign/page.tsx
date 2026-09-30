"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import DeleteConfirmButton from "@/components/academics/buttons/DeleteConfirmButton";
import { useListStore } from "@/lib/mock/createListStore";
import { studentTemplateAssignStore, sketchTemplateStore, testStore } from "@/lib/mock/academics/stores";
import { students, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function StudentTemplateAssignPage() {
  const assignments = useListStore(studentTemplateAssignStore);
  const templates = useListStore(sketchTemplateStore);
  const tests = useListStore(testStore);
  const { toast } = useToast();

  const [studentId, setStudentId] = useState<number | "">("");
  const [testId, setTestId] = useState<number | "">("");
  const [templateId, setTemplateId] = useState<number | "">("");

  function handleAssign() {
    if (!studentId || !testId || !templateId) {
      toast("Select a student, test and template.", "error");
      return;
    }
    studentTemplateAssignStore.add({ id: nextId(), studentId, testId, templateId });
    toast("Template assigned.", "success");
    setStudentId("");
    setTestId("");
    setTemplateId("");
  }

  return (
    <AcademicListPage
      title="Student Template Assign"
      subtitle="Override the report template for an individual student and test."
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Student Template Assign" }]}
    >
      <div className="card card-pad" style={{ maxWidth: 640, marginBottom: 16 }}>
        <div className="field-row">
          <div className="field">
            <label>Student</label>
            <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Test</label>
            <select className="select" value={testId} onChange={(e) => setTestId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Select test</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Template</label>
            <select className="select" value={templateId} onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Select template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <Button variant="primary" onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </div>

      <DataTable
        rowKey={(a) => a.id}
        rows={assignments.map((a) => ({
          ...a,
          studentName: students.find((s) => s.id === a.studentId)?.name ?? "—",
          testName: tests.find((t) => t.id === a.testId)?.name ?? "—",
          templateName: templates.find((t) => t.id === a.templateId)?.name ?? "—",
        }))}
        emptyMessage="No per-student template overrides yet."
        columns={[
          { key: "studentName", header: "Student", sortable: true },
          { key: "testName", header: "Test", sortable: true },
          { key: "templateName", header: "Template", sortable: true },
        ]}
        renderActions={(a) => (
          <DeleteConfirmButton
            iconOnly
            itemLabel="this assignment"
            onConfirm={() => {
              studentTemplateAssignStore.remove(a.id);
              toast("Assignment removed.", "success");
            }}
          />
        )}
      />
    </AcademicListPage>
  );
}
