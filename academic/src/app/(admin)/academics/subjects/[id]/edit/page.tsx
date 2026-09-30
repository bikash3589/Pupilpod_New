"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import SubjectForm, { SubjectDraft } from "@/components/academics/SubjectForm";
import { departmentStore } from "@/lib/mock/academics/stores";
import { useListStore } from "@/lib/mock/createListStore";
import { useToast } from "@/components/ui/Toast";
import { Department } from "@/types/academics";

export default function EditSubjectPage(props: PageProps<"/academics/subjects/[id]/edit">) {
  const { id } = use(props.params);
  const departmentId = Number(id);
  const departments = useListStore(departmentStore);
  const dept = departments.find((d) => d.id === departmentId);
  // Remount (and re-run the lazy draft init below) whenever the loaded record's
  // content actually changes — e.g. once on the localStorage hydration pass —
  // but stay mounted while the user is mid-edit, since nothing else in the
  // store changes until Save.
  return <EditSubjectForm key={JSON.stringify(dept)} departmentId={departmentId} dept={dept} />;
}

function EditSubjectForm({ departmentId, dept }: { departmentId: number; dept: Department | undefined }) {
  const router = useRouter();
  const { toast } = useToast();

  const [showExtra, setShowExtra] = useState(() => !!dept && (dept.readMin != null || dept.writeMin != null || dept.memoryMin != null));
  const [draft, setDraft] = useState<SubjectDraft | null>(() =>
    dept
      ? {
          name: dept.name,
          nameShort: dept.nameShort ?? "",
          type: dept.type,
          subjectCode: dept.subjectCode ?? "",
          sectionIds: dept.sectionIds,
          role: dept.role ?? "",
          readMin: dept.readMin,
          readMedium: dept.readMedium,
          readMax: dept.readMax,
          writeMin: dept.writeMin,
          writeMedium: dept.writeMedium,
          writeMax: dept.writeMax,
          memoryMin: dept.memoryMin,
          memoryMedium: dept.memoryMedium,
          memoryMax: dept.memoryMax,
        }
      : null
  );

  if (!draft) {
    return (
      <AcademicListPage title="Edit Subject" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Subjects", href: "/academics/subjects" }, { label: "Edit" }]}>
        <div className="empty-state">Subject not found.</div>
      </AcademicListPage>
    );
  }

  function handleSubmit() {
    if (!draft) return;
    departmentStore.update(departmentId, {
      name: draft.name,
      nameShort: draft.nameShort || undefined,
      type: draft.type,
      subjectCode: draft.subjectCode || undefined,
      sectionIds: draft.sectionIds,
      role: draft.role || undefined,
      readMin: draft.readMin,
      readMedium: draft.readMedium,
      readMax: draft.readMax,
      writeMin: draft.writeMin,
      writeMedium: draft.writeMedium,
      writeMax: draft.writeMax,
      memoryMin: draft.memoryMin,
      memoryMedium: draft.memoryMedium,
      memoryMax: draft.memoryMax,
    });
    toast("Subject updated.", "success");
    router.push("/academics/subjects");
  }

  return (
    <AcademicListPage
      title="Edit Subject"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Subjects", href: "/academics/subjects" },
        { label: "Edit" },
      ]}
    >
      <div className="checkbox-row mt-8" style={{ marginBottom: 14 }}>
        <input type="checkbox" id="flag" checked={showExtra} onChange={(e) => setShowExtra(e.target.checked)} />
        <label htmlFor="flag" className="disabled-note">
          Simulate school feature flag: showReadWriteMemoryFields
        </label>
      </div>
      <SubjectForm
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/academics/subjects")}
        submitLabel="Save Changes"
        showReadWriteMemoryFields={showExtra}
      />
    </AcademicListPage>
  );
}
