"use client";

import { use } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import LockToggleButton from "@/components/academics/buttons/LockToggleButton";
import { useListStore } from "@/lib/mock/createListStore";
import { testMasterStore, testStore } from "@/lib/mock/academics/stores";

export default function BulkUpdateTestsPage(props: PageProps<"/academics/tests/bulk-update/[testMasterId]">) {
  const { testMasterId } = use(props.params);
  const id = Number(testMasterId);
  const testMasters = useListStore(testMasterStore);
  const tests = useListStore(testStore).filter((t) => t.testMasterId === id);
  const testMaster = testMasters.find((tm) => tm.id === id);

  return (
    <AcademicListPage
      title={`Bulk Update — ${testMaster?.name ?? ""}`}
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Tests", href: "/academics/tests/masters" },
        { label: "Bulk Update", href: "/academics/tests/bulk-update" },
      ]}
    >
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Lock Marks Entry</th>
                <th>Publish</th>
                <th>HTML Report</th>
                <th>PDF Report</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <LockToggleButton
                      label="Lock Marks Entry"
                      activeLabel="Locked"
                      inactiveLabel="Unlocked"
                      value={t.lockMarksEntry}
                      onToggle={(v) => testStore.update(t.id, { lockMarksEntry: v })}
                    />
                  </td>
                  <td>
                    <LockToggleButton
                      label="Publish"
                      activeLabel="Published"
                      inactiveLabel="Unpublished"
                      value={t.enablePublish}
                      onToggle={(v) => testStore.update(t.id, { enablePublish: v })}
                    />
                  </td>
                  <td>
                    <LockToggleButton
                      label="HTML"
                      activeLabel="Shown"
                      inactiveLabel="Hidden"
                      value={t.enableHtml}
                      onToggle={(v) => testStore.update(t.id, { enableHtml: v })}
                    />
                  </td>
                  <td>
                    <LockToggleButton
                      label="PDF"
                      activeLabel="Shown"
                      inactiveLabel="Hidden"
                      value={t.enablePdf}
                      onToggle={(v) => testStore.update(t.id, { enablePdf: v })}
                    />
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No test instances under this test master.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AcademicListPage>
  );
}
