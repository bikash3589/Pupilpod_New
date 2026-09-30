"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import ElectiveGroupForm, { ElectiveGroupDraft } from "@/components/academics/ElectiveGroupForm";
import { electiveGroupStore } from "@/lib/mock/academics/stores";
import { academicYears, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function NewElectiveGroupPage() {
  return (
    <Suspense fallback={null}>
      <NewElectiveGroupForm />
    </Suspense>
  );
}

function NewElectiveGroupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [draft, setDraft] = useState<ElectiveGroupDraft>({
    name: "",
    orderNo: 1,
    minSelection: 1,
    maxSelection: 1,
    programId: searchParams.get("programId") ? Number(searchParams.get("programId")) : null,
    yearGroupId: searchParams.get("yearGroupId") ? Number(searchParams.get("yearGroupId")) : null,
    sectionIds: [],
    departmentIds: [],
  });

  function handleSubmit() {
    if (!draft.programId || !draft.yearGroupId) return;
    electiveGroupStore.add({
      id: nextId(),
      name: draft.name,
      orderNo: draft.orderNo,
      minSelection: draft.minSelection,
      maxSelection: draft.maxSelection,
      academicYearId: academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0].id,
      programId: draft.programId,
      yearGroupId: draft.yearGroupId,
      sectionIds: draft.sectionIds,
      departmentIds: draft.departmentIds,
    });
    toast("Elective group created.", "success");
    router.push("/academics/electives/groups");
  }

  return (
    <AcademicListPage
      title="Add Elective Group"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Electives", href: "/academics/electives/groups" },
        { label: "Add" },
      ]}
    >
      <ElectiveGroupForm
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/academics/electives/groups")}
        submitLabel="Create Group"
      />
    </AcademicListPage>
  );
}
