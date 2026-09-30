"use client";

import { use, useMemo, useState } from "react";
import AcademicListPage from "@/components/academics/AcademicListPage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useListStore } from "@/lib/mock/createListStore";
import { sketchStore, sketchAttributeStore } from "@/lib/mock/academics/stores";
import { students, rollGroups } from "@/lib/mock/academics/lookups";
import { useToast } from "@/components/ui/Toast";

interface ClassSectionRow {
  id: string;
  program: string;
  className: string;
  sectionName: string;
  classSectionLabel: string;
  rollGroupId: number;
  generatedBy?: string;
  generatedDate?: string;
}

const initialClassSectionRows: ClassSectionRow[] = [
  { id: "1-A", program: "CBSE", className: "Class 1", sectionName: "A", classSectionLabel: "Class 1 - A", rollGroupId: 1, generatedBy: "Anand Pupilpod", generatedDate: "31-07-2026 12:52:45" },
  { id: "1-B", program: "CBSE", className: "Class 1", sectionName: "B", classSectionLabel: "Class 1 - B", rollGroupId: 2 },
  { id: "1-C", program: "CBSE", className: "Class 1", sectionName: "C", classSectionLabel: "Class 1 - C", rollGroupId: 3 },
  { id: "1-D", program: "CBSE", className: "Class 1", sectionName: "D", classSectionLabel: "Class 1 - D", rollGroupId: 4 },
  { id: "2-A", program: "CBSE", className: "Class 2", sectionName: "A", classSectionLabel: "Class 2 - A", rollGroupId: 8 },
  { id: "2-B", program: "CBSE", className: "Class 2", sectionName: "B", classSectionLabel: "Class 2 - B", rollGroupId: 9 },
  { id: "3-A", program: "CBSE", className: "Class 3", sectionName: "A", classSectionLabel: "Class 3 - A", rollGroupId: 10 },
  { id: "3-B", program: "CBSE", className: "Class 3", sectionName: "B", classSectionLabel: "Class 3 - B", rollGroupId: 11 },
];

export default function GenerateSketchResultPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const sketchId = Number(id);
  const sketches = useListStore(sketchStore);
  const sketchAttributes = useListStore(sketchAttributeStore).filter((a) => a.sketchId === sketchId);
  const sketch = sketches.find((s) => s.id === sketchId);
  const { toast } = useToast();

  const [classRows, setClassRows] = useState<ClassSectionRow[]>(initialClassSectionRows);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(["1-A"]);
  const [activeClassId, setActiveClassId] = useState<string>("1-A");

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([1, 2]);
  const [activeStudentId, setActiveStudentId] = useState<number>(1);

  // Search states for 3 panels
  const [searchClass, setSearchClass] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [searchAttr, setSearchAttr] = useState("");

  // Edit Data Modal State
  const [editModal, setEditModal] = useState(false);
  const [editingAttrValues, setEditingAttrValues] = useState<{ [key: string]: string }>({
    "Mathematics Marks": "88",
    "Total Marks": "442",
    "Attendance %": "96%",
  });

  // Filtered Class Rows
  const filteredClassRows = useMemo(() => {
    if (!searchClass.trim()) return classRows;
    const q = searchClass.toLowerCase();
    return classRows.filter(
      (r) =>
        r.program.toLowerCase().includes(q) ||
        r.classSectionLabel.toLowerCase().includes(q) ||
        (r.generatedBy && r.generatedBy.toLowerCase().includes(q))
    );
  }, [classRows, searchClass]);

  // Active Class Section
  const activeClassRow = classRows.find((r) => r.id === activeClassId) || classRows[0];

  // Students for Active Class Section
  const activeStudents = useMemo(() => {
    const rollId = activeClassRow?.rollGroupId;
    const list = rollId ? students.filter((s) => s.rollGroupId === rollId) : students.slice(0, 5);
    if (!searchStudent.trim()) return list;
    const q = searchStudent.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q));
  }, [activeClassRow, searchStudent]);

  // Active Student
  const activeStudent = students.find((s) => s.id === activeStudentId) || activeStudents[0] || students[0];

  // Default Master Attributes for the Sketch
  const masterAttributes = useMemo(() => {
    if (sketchAttributes.length > 0) {
      return sketchAttributes.map((a) => ({
        masterName: a.attributeName,
        nameWord: a.attributeName.slice(0, 6).toUpperCase(),
        defaultValue: a.attributeCategory === "Attendance" ? "96%" : a.attributeType === "Marks" ? "88" : "442",
      }));
    }
    return [
      { masterName: "Student Name", nameWord: "NAME", defaultValue: activeStudent?.name || "Aarav Shah" },
      { masterName: "Admission No", nameWord: "ADMNO", defaultValue: activeStudent?.admissionNo || "ADM-1001" },
      { masterName: "Mathematics Marks", nameWord: "MATHS", defaultValue: editingAttrValues["Mathematics Marks"] || "88" },
      { masterName: "Total Marks", nameWord: "TOTAL", defaultValue: editingAttrValues["Total Marks"] || "442" },
      { masterName: "Attendance %", nameWord: "ATT", defaultValue: editingAttrValues["Attendance %"] || "96%" },
    ];
  }, [sketchAttributes, activeStudent, editingAttrValues]);

  // Filtered Master Attributes
  const filteredAttributes = useMemo(() => {
    if (!searchAttr.trim()) return masterAttributes;
    const q = searchAttr.toLowerCase();
    return masterAttributes.filter(
      (a) => a.masterName.toLowerCase().includes(q) || a.nameWord.toLowerCase().includes(q)
    );
  }, [masterAttributes, searchAttr]);

  // Handlers for Top Right 5 Buttons
  function handleGenerateResult() {
    if (selectedClassIds.length === 0) {
      toast("Please select at least one Class-Section to generate result.", "error");
      return;
    }
    const nowStr = new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString();
    setClassRows((prev) =>
      prev.map((r) =>
        selectedClassIds.includes(r.id)
          ? { ...r, generatedBy: "Anand Pupilpod", generatedDate: nowStr }
          : r
      )
    );
    toast(`Sketch result generated successfully for ${selectedClassIds.length} class section(s).`, "success");
  }

  function handleDeleteGeneratedResult() {
    if (selectedClassIds.length === 0) {
      toast("Please select at least one Class-Section.", "error");
      return;
    }
    setClassRows((prev) =>
      prev.map((r) =>
        selectedClassIds.includes(r.id)
          ? { ...r, generatedBy: undefined, generatedDate: undefined }
          : r
      )
    );
    toast("Generated result deleted for selected class section(s).", "success");
  }

  function handleDownloadResult() {
    toast("Downloading generated result as CSV file...", "info");
    const header = "Program,Class-Section,Generated By,Generated Date\n";
    const body = classRows
      .filter((r) => r.generatedBy)
      .map((r) => `"${r.program}","${r.classSectionLabel}","${r.generatedBy}","${r.generatedDate}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sketch?.sketchName || "Sketch"}_Result.csv`;
    a.click();
  }

  function handleGenerateReport() {
    toast(`Generating PDF Report Cards for ${selectedStudentIds.length} student(s)...`, "success");
  }

  function toggleAllClasses() {
    if (selectedClassIds.length === filteredClassRows.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(filteredClassRows.map((r) => r.id));
    }
  }

  function toggleAllStudents() {
    if (selectedStudentIds.length === activeStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(activeStudents.map((s) => s.id));
    }
  }

  return (
    <AcademicListPage
      title="Generate Sketch Result"
      breadcrumb={[
        { label: "Academics", href: "/academics" },
        { label: "Manage Sketch", href: "/academics/sketches" },
        { label: "Generate Sketch Result" },
      ]}
    >
      <div className="card card-pad flex flex-col gap-16">
        {/* Top Header Row with Title and 5 Blue Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-12 border-b pb-12">
          <div className="text-base font-bold text-slate-800">
            Sketch Name - <span className="text-primary">{sketch?.sketchName || "Half_Yearly_1_5"}</span>
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            <Button variant="primary" onClick={() => setEditModal(true)}>
              Edit Data
            </Button>
            <Button variant="primary" onClick={handleDownloadResult}>
              Download Result
            </Button>
            <Button variant="primary" onClick={handleGenerateResult}>
              Generate Result
            </Button>
            <Button variant="primary" onClick={handleDeleteGeneratedResult}>
              Delete Generated Result
            </Button>
            <Button variant="primary" onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>

        {/* 3-Column Side-by-Side Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Column 1: Class - Section List Panel */}
          <div className="lg:col-span-5 card p-12 border rounded-md">
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search"
                className="input input-sm w-full"
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
              />
            </div>
            <div className="table-wrap max-h-96 overflow-y-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        checked={selectedClassIds.length === filteredClassRows.length && filteredClassRows.length > 0}
                        onChange={toggleAllClasses}
                      />
                    </th>
                    <th>PROGRAM</th>
                    <th>CLASS - SECTION</th>
                    <th>GENERATED BY</th>
                    <th>GENERATED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassRows.map((r) => {
                    const isChecked = selectedClassIds.includes(r.id);
                    const isActive = activeClassId === r.id;
                    return (
                      <tr
                        key={r.id}
                        className={isActive ? "bg-blue-50 font-semibold" : undefined}
                        onClick={() => setActiveClassId(r.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setSelectedClassIds((prev) =>
                                prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                              )
                            }
                          />
                        </td>
                        <td>{r.program}</td>
                        <td>{r.classSectionLabel}</td>
                        <td>{r.generatedBy || ""}</td>
                        <td>{r.generatedDate || ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 2: Student Name Panel */}
          <div className="lg:col-span-3 card p-12 border rounded-md">
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search"
                className="input input-sm w-full"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
            <div className="table-wrap max-h-96 overflow-y-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === activeStudents.length && activeStudents.length > 0}
                        onChange={toggleAllStudents}
                      />
                    </th>
                    <th>STUDENT NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((s) => {
                    const isChecked = selectedStudentIds.includes(s.id);
                    const isActive = activeStudentId === s.id;
                    return (
                      <tr
                        key={s.id}
                        className={isActive ? "bg-blue-50 font-semibold" : undefined}
                        onClick={() => setActiveStudentId(s.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setSelectedStudentIds((prev) =>
                                prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                              )
                            }
                          />
                        </td>
                        <td>{s.name}</td>
                      </tr>
                    );
                  })}
                  {activeStudents.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-center text-muted py-12">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 3: Attribute Values Details Panel */}
          <div className="lg:col-span-4 card p-12 border rounded-md">
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search"
                className="input input-sm w-full"
                value={searchAttr}
                onChange={(e) => setSearchAttr(e.target.value)}
              />
            </div>
            <div className="table-wrap max-h-96 overflow-y-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>MASTER ATTRIBUTE NAME</th>
                    <th>ATTRIBUTE NAME WORD</th>
                    <th>ATTRIBUTE VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttributes.map((attr, idx) => (
                    <tr key={idx}>
                      <td>{activeStudent?.name || "Aarav Shah"}</td>
                      <td>{attr.masterName}</td>
                      <td>{attr.nameWord}</td>
                      <td className="font-semibold text-primary">{attr.defaultValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Data Modal */}
      <Modal open={editModal} title={`Edit Student Data — ${activeStudent?.name || ""}`} onClose={() => setEditModal(false)}>
        <div className="field">
          <label>Mathematics Marks</label>
          <input
            className="input"
            value={editingAttrValues["Mathematics Marks"] || "88"}
            onChange={(e) => setEditingAttrValues({ ...editingAttrValues, "Mathematics Marks": e.target.value })}
          />
        </div>
        <div className="field">
          <label>Total Marks</label>
          <input
            className="input"
            value={editingAttrValues["Total Marks"] || "442"}
            onChange={(e) => setEditingAttrValues({ ...editingAttrValues, "Total Marks": e.target.value })}
          />
        </div>
        <div className="field">
          <label>Attendance %</label>
          <input
            className="input"
            value={editingAttrValues["Attendance %"] || "96%"}
            onChange={(e) => setEditingAttrValues({ ...editingAttrValues, "Attendance %": e.target.value })}
          />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast("Student data updated successfully.", "success");
              setEditModal(false);
            }}
          >
            Save Changes
          </Button>
        </div>
      </Modal>
    </AcademicListPage>
  );
}
