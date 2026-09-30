"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import ElectiveGroupForm, { ElectiveGroupDraft } from "@/components/academics/ElectiveGroupForm";
import { electiveGroupStore } from "@/lib/mock/academics/stores";
import { useListStore } from "@/lib/mock/createListStore";
import { useToast } from "@/components/ui/Toast";
import { ElectiveGroup } from "@/types/academics";

export default function EditElectiveGroupPage(props: PageProps<"/academics/electives/groups/[id]/edit">) {
  const { id } = use(props.params);
  const groupId = Number(id);
  const groups = useListStore(electiveGroupStore);
  const g = groups.find((x) => x.id === groupId);
  return <EditElectiveGroupForm key={JSON.stringify(g)} groupId={groupId} g={g} />;
}

function EditElectiveGroupForm({ groupId, g }: { groupId: number; g: ElectiveGroup | undefined }) {
  const router = useRouter();
  const { toast } = useToast();

  const [draft, setDraft] = useState<ElectiveGroupDraft | null>(() =>
    g
      ? {
          name: g.name,
          orderNo: g.orderNo,
          minSelection: g.minSelection,
          maxSelection: g.maxSelection,
          programId: g.programId,
          yearGroupId: g.yearGroupId,
          sectionIds: g.sectionIds,
          departmentIds: g.departmentIds,
        }
      : null
  );

  if (!draft) {
    return (
      <AcademicListPage title="Edit Elective Group" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Electives", href: "/academics/electives/groups" }, { label: "Edit" }]}>
        <div className="empty-state">Elective group not found.</div>
      </AcademicListPage>
    );
  }

  function handleSubmit() {
    if (!draft || !draft.programId || !draft.yearGroupId) return;
    electiveGroupStore.update(groupId, {
      name: draft.name,
      orderNo: draft.orderNo,
      minSelection: draft.minSelection,
      maxSelection: draft.maxSelection,
      programId: draft.programId,
      yearGroupId: draft.yearGroupId,
      sectionIds: draft.sectionIds,
      departmentIds: draft.departmentIds,
    });
    toast("Elective group updated.", "success");
    router.push("/academics/electives/groups");
  }

  return (
    <AcademicListPage
      title="Edit Elective Group"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Electives", href: "/academics/electives/groups" },
        { label: "Edit" },
      ]}
    >
      <ElectiveGroupForm value={draft} onChange={setDraft} onSubmit={handleSubmit} onCancel={() => router.push("/academics/electives/groups")} submitLabel="Save Changes" />
    </AcademicListPage>
  );
}
