"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import TestInstanceForm, { TestInstanceDraft } from "@/components/academics/TestInstanceForm";
import { testStore } from "@/lib/mock/academics/stores";
import { useListStore } from "@/lib/mock/createListStore";
import { useToast } from "@/components/ui/Toast";
import { ExaminationTest } from "@/types/academics";

export default function EditTestInstancePage(props: PageProps<"/academics/tests/instances/[id]/edit">) {
  const { id } = use(props.params);
  const testId = Number(id);
  const tests = useListStore(testStore);
  const t = tests.find((x) => x.id === testId);
  return <EditTestInstanceForm key={JSON.stringify(t)} testId={testId} t={t} />;
}

function EditTestInstanceForm({ testId, t }: { testId: number; t: ExaminationTest | undefined }) {
  const router = useRouter();
  const { toast } = useToast();

  const [draft, setDraft] = useState<TestInstanceDraft | null>(() =>
    t
      ? {
          name: t.name,
          programId: t.programId,
          yearGroupId: t.yearGroupId,
          rollGroupId: t.rollGroupId ?? null,
          gradeSystemId: t.gradeSystemId ?? null,
          assessmentMethod: t.assessmentMethod,
          assessmentOption: t.assessmentOption,
          maxMarks: t.maxMarks ?? "",
          minMarks: t.minMarks ?? "",
          enableRemarks: t.enableRemarks,
          enableSchedule: t.enableSchedule,
          startDate: t.startDate ?? "",
          endDate: t.endDate ?? "",
          isShow: t.isShow,
          enableHtml: t.enableHtml,
          enablePdf: t.enablePdf,
          enablePublish: t.enablePublish,
          enableTestReport: t.enableTestReport,
          lockMarksEntry: t.lockMarksEntry,
        }
      : null
  );

  if (!draft) {
    return (
      <AcademicListPage title="Edit Test Instance" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Instances", href: "/academics/tests/instances" }, { label: "Edit" }]}>
        <div className="empty-state">Test instance not found.</div>
      </AcademicListPage>
    );
  }

  function handleSubmit() {
    if (!draft || !draft.programId || !draft.yearGroupId) return;
    testStore.update(testId, {
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
    toast("Test instance updated.", "success");
    router.push("/academics/tests/instances");
  }

  return (
    <AcademicListPage
      title="Edit Test Instance"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Instances", href: "/academics/tests/instances" },
        { label: "Edit" },
      ]}
    >
      <TestInstanceForm value={draft} onChange={setDraft} onSubmit={handleSubmit} onCancel={() => router.push("/academics/tests/instances")} submitLabel="Save Changes" />
    </AcademicListPage>
  );
}
