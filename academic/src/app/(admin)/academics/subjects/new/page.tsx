"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import SubjectForm, { SubjectDraft } from "@/components/academics/SubjectForm";
import { departmentStore } from "@/lib/mock/academics/stores";
import { nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

const empty: SubjectDraft = {
  name: "",
  nameShort: "",
  type: "Learning Area",
  subjectCode: "",
  sectionIds: [],
  role: "",
};

export default function NewSubjectPage() {
  const [draft, setDraft] = useState<SubjectDraft>(empty);
  const [showExtra, setShowExtra] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function handleSubmit() {
    departmentStore.add({
      id: nextId(),
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
    toast("Subject created.", "success");
    router.push("/academics/subjects");
  }

  return (
    <AcademicListPage
      title="Add Subject"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Subjects", href: "/academics/subjects" },
        { label: "Add" },
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
        submitLabel="Create Subject"
        showReadWriteMemoryFields={showExtra}
      />
    </AcademicListPage>
  );
}
