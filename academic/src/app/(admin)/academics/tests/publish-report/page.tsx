"use client";

import { useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import CascadingClassPicker from "@/components/academics/CascadingClassPicker";
import Button from "@/components/ui/Button";
import { useListStore } from "@/lib/mock/createListStore";
import { testStore } from "@/lib/mock/academics/stores";
import { useToast } from "@/components/ui/Toast";

export default function PublishReportPage() {
  const tests = useListStore(testStore);
  const { toast } = useToast();
  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);
  const [rollGroupId, setRollGroupId] = useState<number | null>(null);

  const filtered = tests.filter(
    (t) =>
      (!programId || t.programId === programId) &&
      (!yearGroupId || t.yearGroupId === yearGroupId) &&
      (!rollGroupId || !t.rollGroupId || t.rollGroupId === rollGroupId)
  );

  return (
    <AcademicListPage
      title="Publish Test Report"
      breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Tests", href: "/academics/tests/masters" }, { label: "Publish Report" }]}
    >
      <div className="filter-bar">
        <CascadingClassPicker
          programId={programId}
          yearGroupId={yearGroupId}
          rollGroupId={rollGroupId}
          onChange={(next) => {
            setProgramId(next.programId);
            setYearGroupId(next.yearGroupId);
            setRollGroupId(next.rollGroupId);
          }}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <span className={`badge ${t.enablePublish ? "badge-success" : "badge-neutral"}`}>{t.enablePublish ? "Published" : "Not Published"}</span>
                  </td>
                  <td>
                    <Button
                      variant={t.enablePublish ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => {
                        testStore.update(t.id, { enablePublish: !t.enablePublish });
                        toast(t.enablePublish ? "Report unpublished." : "Report published.", "success");
                      }}
                    >
                      {t.enablePublish ? "Unpublish" : "Publish"}
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">Select a class to see its tests.</div>
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
