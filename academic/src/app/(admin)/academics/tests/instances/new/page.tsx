"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import TestInstanceForm, { TestInstanceDraft } from "@/components/academics/TestInstanceForm";
import { testStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

const empty: TestInstanceDraft = {
  name: "",
  programId: null,
  yearGroupId: null,
  rollGroupId: null,
  gradeSystemId: null,
  assessmentMethod: "Marks",
  assessmentOption: "Radio Button",
  maxMarks: 100,
  minMarks: 33,
  enableRemarks: false,
  enableSchedule: false,
  startDate: "",
  endDate: "",
  isShow: true,
  enableHtml: false,
  enablePdf: false,
  enablePublish: false,
  enableTestReport: false,
  lockMarksEntry: false,
};

export default function NewTestInstancePage() {
  const [draft, setDraft] = useState<TestInstanceDraft>(empty);
  const router = useRouter();
  const { toast } = useToast();

  function handleSubmit() {
    if (!draft.programId || !draft.yearGroupId) return;
    testStore.add({
      id: nextId(),
      name: draft.name,
      programId: draft.programId,
      yearGroupId: draft.yearGroupId,
      rollGroupId: draft.rollGroupId ?? undefined,
      gradeSystemId: draft.gradeSystemId ?? undefined,
      assessmentMethod: draft.assessmentMethod,
      assessmentOption: draft.assessmentOption,
      maxMarks: draft.maxMarks === "" ? undefined : draft.maxMarks,
      minMarks: draft.minMarks === "" ? undefined : draft.minMarks,
      enableRemarks: draft.enableRemarks,
      enableSchedule: draft.enableSchedule,
      startDate: draft.startDate || undefined,
      endDate: draft.endDate || undefined,
      isShow: draft.isShow,
      enableHtml: draft.enableHtml,
      enablePdf: draft.enablePdf,
      enablePublish: draft.enablePublish,
      enableTestReport: draft.enableTestReport,
      lockMarksEntry: draft.lockMarksEntry,
    });
    toast("Test instance created.", "success");
    router.push("/academics/tests/instances");
  }

  return (
    <AcademicListPage
      title="Add Test Instance"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Tests", href: "/academics/tests/masters" },
        { label: "Instances", href: "/academics/tests/instances" },
        { label: "Add" },
      ]}
    >
      <TestInstanceForm value={draft} onChange={setDraft} onSubmit={handleSubmit} onCancel={() => router.push("/academics/tests/instances")} submitLabel="Create Test" />
    </AcademicListPage>
  );
}
