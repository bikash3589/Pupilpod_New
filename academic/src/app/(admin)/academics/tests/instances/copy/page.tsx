"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CopyToDestinationModal from "@/components/academics/buttons/CopyToDestinationModal";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore } from "@/lib/mock/academics/stores";

export default function CopyTestPage() {
  const tests = useListStore(testStore);
  const [testId, setTestId] = useState<number | "">("");
  const test = tests.find((t) => t.id === testId);

  return (
    <AcademicListPage
      title="Copy Test to Other Sections"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Instances", href: "/academics/tests/instances" },
        { label: "Copy" },
      ]}
    >
      <div className="card card-pad" style={{ maxWidth: 560 }}>
        <div className="field">
          <label>Source Test</label>
          <select className="select" value={testId} onChange={(e) => setTestId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select test</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        {test && (
          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <CopyToDestinationModal sourceLabel={test.name} triggerLabel="Copy to destination" onCopy={() => undefined} />
          </div>
        )}
      </div>
    </AcademicListPage>
  );
}
