"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import { testMasterStore } from "@/lib/mock/academics/stores";
import { useListStore } from "@/lib/mock/createListStore";
import { useToast } from "@/components/ui/Toast";
import { TestMaster } from "@/types/academics";

export default function EditTestMasterPage(props: PageProps<"/academics/tests/masters/[id]/edit">) {
  const { id } = use(props.params);
  const testMasterId = Number(id);
  const testMasters = useListStore(testMasterStore);
  const tm = testMasters.find((x) => x.id === testMasterId);
  return <EditTestMasterForm key={JSON.stringify(tm)} testMasterId={testMasterId} tm={tm} />;
}

function EditTestMasterForm({ testMasterId, tm }: { testMasterId: number; tm: TestMaster | undefined }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<{ name: string; code: string } | null>(() => (tm ? { name: tm.name, code: tm.code } : null));

  if (!form) {
    return (
      <AcademicListPage title="Edit Test Master" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Tests", href: "/academics/tests/masters" }, { label: "Edit" }]}>
        <div className="empty-state">Test master not found.</div>
      </AcademicListPage>
    );
  }

  return (
    <AcademicListPage
      title="Edit Test Master"
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Tests", href: "/academics/tests/masters" }, { label: "Edit" }]}
    >
      <div className="card card-pad" style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Code</label>
          <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => router.push("/academics/tests/masters")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              testMasterStore.update(testMasterId, form);
              toast("Test master updated.", "success");
              router.push("/academics/tests/masters");
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </AcademicListPage>
  );
}
