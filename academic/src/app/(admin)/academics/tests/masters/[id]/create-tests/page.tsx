"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import { useListStore } from "@/lib/mock/createListStore";
import { testMasterStore, testStore } from "@/lib/mock/academics/stores";
import { programs, rollGroups, yearGroups, nextId } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

export default function CreateTestsPage(props: PageProps<"/academics/tests/masters/[id]/create-tests">) {
  const { id } = use(props.params);
  const testMasterId = Number(id);
  const testMasters = useListStore(testMasterStore);
  const existingTests = useListStore(testStore);
  const testMaster = testMasters.find((tm) => tm.id === testMasterId);
  const router = useRouter();
  const { toast } = useToast();

  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(rollGroupId: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(rollGroupId)) {
        next.delete(rollGroupId);
      } else {
        next.add(rollGroupId);
      }
      return next;
    });
  }

  function handleGenerate() {
    if (checked.size === 0) {
      toast("Select at least one section.", "error");
      return;
    }
    let created = 0;
    checked.forEach((rollGroupId) => {
      const rg = rollGroups.find((r) => r.id === rollGroupId)!;
      const yg = yearGroups.find((y) => y.id === rg.yearGroupId)!;
      const alreadyExists = existingTests.some((t) => t.testMasterId === testMasterId && t.rollGroupId === rollGroupId);
      if (alreadyExists) return;
      testStore.add({
        id: nextId(),
        testMasterId,
        name: `${testMaster?.name} - ${yg.name} ${rg.name}`,
        programId: yg.programId,
        yearGroupId: yg.id,
        rollGroupId: rg.id,
        assessmentMethod: "Marks",
        assessmentOption: "Radio Button",
        maxMarks: 100,
        minMarks: 33,
        enableRemarks: false,
        enableSchedule: false,
        isShow: true,
        enableHtml: false,
        enablePdf: false,
        enablePublish: false,
        enableTestReport: false,
        lockMarksEntry: false,
      });
      created += 1;
    });
    toast(`${created} test instance(s) generated.`, "success");
    router.push("/academics/tests/instances");
  }

  return (
    <AcademicListPage
      title={`Create Tests — ${testMaster?.name ?? ""}`}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Tests", href: "/academics/tests/masters" },
        { label: "Create Tests" },
      ]}
      actions={
        <Button variant="primary" size="sm" onClick={handleGenerate}>
          Generate
        </Button>
      }
    >
      <div className="card card-pad">
        {programs.map((p) => (
          <div key={p.id} className="mt-16">
            <div className="section-title">{p.name}</div>
            {yearGroups
              .filter((yg) => yg.programId === p.id)
              .map((yg) => (
                <div key={yg.id} style={{ marginBottom: 10 }}>
                  <strong className="text-sm">{yg.name}</strong>
                  <div className="pill-list mt-8">
                    {rollGroups
                      .filter((rg) => rg.yearGroupId === yg.id)
                      .map((rg) => {
                        const already = existingTests.some((t) => t.testMasterId === testMasterId && t.rollGroupId === rg.id);
                        return (
                          <label key={rg.id} className={`checkbox-row ${already ? "disabled-note" : ""}`} style={{ background: "#f2f4f8", padding: "4px 10px", borderRadius: 999 }}>
                            <input type="checkbox" disabled={already} checked={checked.has(rg.id)} onChange={() => toggle(rg.id)} />
                            {rg.name}
                            {already ? " (created)" : ""}
                          </label>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </AcademicListPage>
  );
}
