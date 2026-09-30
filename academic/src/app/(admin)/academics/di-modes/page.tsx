"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import { useListStore } from "@/lib/mock/createListStore";
import { curriculumStore, departmentStore, skillStore } from "@/lib/mock/academics/stores";
import { programs, yearGroupsForProgram } from "@/lib/mock/academics/lookups";
import { diModeOptions } from "@/lib/mock/academics/diModes";
import { DIMode } from "@/types/academics";
import { useToast } from "@/components/ui/Toast";

interface Query {
  programId: number;
  yearGroupId: number;
  departmentId: number;
}

export default function DescriptiveIndicatorConfigPage() {
  const departments = useListStore(departmentStore);
  const skills = useListStore(skillStore);
  const curriculum = useListStore(curriculumStore);
  const { toast } = useToast();

  const [programId, setProgramId] = useState<number | null>(null);
  const [yearGroupId, setYearGroupId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [skillId, setSkillId] = useState<number | null>(null);
  const [query, setQuery] = useState<Query | null>(null);
  const [diMode, setDiMode] = useState<DIMode>("FREE_FORM");

  const yearGroupOptions = yearGroupsForProgram(programId);
  const curriculumEntry = query
    ? curriculum.find((c) => c.programId === query.programId && c.yearGroupId === query.yearGroupId && c.departmentId === query.departmentId)
    : undefined;

  function handleGo() {
    if (!programId || !yearGroupId || !departmentId) return;
    const entry = curriculum.find((c) => c.programId === programId && c.yearGroupId === yearGroupId && c.departmentId === departmentId);
    setDiMode(entry?.diMode ?? "FREE_FORM");
    setQuery({ programId, yearGroupId, departmentId });
  }

  function handleSave() {
    if (!query || !curriculumEntry) return;
    curriculumStore.update(curriculumEntry.id, { diMode });
    toast("D.I. Mode saved.", "success");
  }

  return (
    <AcademicListPage title="Descriptive Indicator Config" breadcrumb={[{ label: "Academics", href: "/academics" }, { label: "Descriptive Indicator Config" }]}>
      <div className="card card-pad">
        <div className="section-title" style={{ border: "none", marginBottom: 14, paddingBottom: 0 }}>
          Descriptive Indicator Configuration
        </div>
        <div className="flex items-center gap-12" style={{ flexWrap: "wrap" }}>
          <select
            className="select"
            style={{ width: 200 }}
            value={programId ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setProgramId(val);
              setYearGroupId(null);
              setDepartmentId(null);
              setQuery(null);
            }}
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            style={{ width: 200 }}
            value={yearGroupId ?? ""}
            disabled={!programId}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setYearGroupId(val);
              setDepartmentId(null);
              setQuery(null);
            }}
          >
            <option value="">Select Class</option>
            {yearGroupOptions.map((yg) => (
              <option key={yg.id} value={yg.id}>
                {yg.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            style={{ width: 200 }}
            value={departmentId ?? ""}
            disabled={!yearGroupId}
            onChange={(e) => {
              setDepartmentId(e.target.value ? Number(e.target.value) : null);
              setQuery(null);
            }}
          >
            <option value="">Select subject</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select className="select" style={{ width: 200 }} value={skillId ?? ""} onChange={(e) => setSkillId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Select Skill</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            onClick={handleGo}
            disabled={!programId || !yearGroupId || !departmentId}
            disabledReason="Select a Program, Class and Subject first."
          >
            Go
          </Button>

          <div className="flex items-center gap-8" style={{ marginLeft: "auto" }}>
            {!query ? (
              <span className="text-muted" style={{ fontWeight: 700, fontSize: "12.5px" }}>
                DI MODE
              </span>
            ) : !curriculumEntry ? (
              <span className="disabled-note">
                {departments.find((d) => d.id === query.departmentId)?.name} isn&apos;t part of this class&apos;s curriculum yet — add it via{" "}
                <Link href="/academics/curriculum" className="btn-link">
                  Subject To Class
                </Link>
                .
              </span>
            ) : (
              <>
                <label className="text-sm" style={{ fontWeight: 700 }}>
                  D.I. Mode
                </label>
                <select className="select" style={{ width: 220 }} value={diMode} onChange={(e) => setDiMode(e.target.value as DIMode)}>
                  {diModeOptions.map((m) => (
                    <option key={m.code} value={m.code} title={m.description}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {skillId !== null && (
          <p className="disabled-note mt-12">
            D.I. Mode is configured per Subject only — the selected Skill does not change what gets saved (see
            ACADEMIC_DATABASE_SCHEMA.md SubjectToClassCurriculum).
          </p>
        )}
      </div>
    </AcademicListPage>
  );
}
