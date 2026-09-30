'use client';

import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { AcademicProgram, AcademicClass, AcademicSection, Student } from '../types/attendance';
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown';

interface SetFutureAbsenceFormProps {
  programs: AcademicProgram[];
  classes: AcademicClass[];
  sections: AcademicSection[];
  students: (Student & { classId: string; sectionId: string; programId: string })[];
  selectedProgram: string;
  selectedClasses: string[];
  selectedSections: string[];
  selectedStudentIds: string[];
  onProgramChange: (val: string) => void;
  onClassesChange: (vals: string[]) => void;
  onSectionsChange: (vals: string[]) => void;
  onStudentsChange: (vals: string[]) => void;
  onClearFilters: () => void;
  onGo: () => void;
  onFillDemo?: () => void;
}

export const SetFutureAbsenceForm: React.FC<SetFutureAbsenceFormProps> = ({
  programs,
  classes,
  sections,
  students,
  selectedProgram,
  selectedClasses,
  selectedSections,
  selectedStudentIds,
  onProgramChange,
  onClassesChange,
  onSectionsChange,
  onStudentsChange,
  onClearFilters,
  onGo,
  onFillDemo,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGo();
  };

  // Prepare Class options for MultiSelect
  const classOptions: MultiSelectOption[] = classes.map((cls) => ({
    id: cls.id,
    label: cls.name,
    badge: cls.code,
  }));

  // Prepare Section options for MultiSelect
  const sectionOptions: MultiSelectOption[] = sections.map((sec) => {
    const parentClass = classes.find((c) => c.id === sec.classId);
    return {
      id: sec.id,
      label: sec.name,
      subLabel: parentClass ? parentClass.name : undefined,
    };
  });

  // Prepare Student options for MultiSelect
  const studentOptions: MultiSelectOption[] = students.map((std) => {
    const parentClass = classes.find((c) => c.id === std.classId);
    const parentSec = sections.find((s) => s.id === std.sectionId);
    return {
      id: std.id,
      label: `${std.firstName} ${std.lastName}`,
      subLabel: `Roll: ${std.rollNo} • Adm: ${std.admissionNo}`,
      badge: parentClass && parentSec ? `${parentClass.name} - ${parentSec.name}` : undefined,
      avatarText: `${std.firstName[0]}${std.lastName[0]}`,
    };
  });

  return (
    <div className="choose-student-form-container">
      {/* Subtitle matching specification */}
      <div className="choose-student-heading-row">
        <h2 className="choose-student-heading">Choose Students for Future Absence</h2>
        {/* <span className="multi-select-note-badge">Multi-Selection Enabled</span> */}
      </div>

      <form className="choose-student-form" onSubmit={handleSubmit}>
        {/* 4-Column Grid: Program, Class (Multi), Section (Multi), Students (Multi) */}
        <div className="choose-student-grid">
          {/* 1. Program * */}
          <div className="form-group choose-field">
            <label htmlFor="fa-program-select" className="form-label">
              Program <span className="required-star">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="fa-program-select"
                className="form-control form-select"
                value={selectedProgram}
                onChange={(e) => onProgramChange(e.target.value)}
              >
                <option value="">Select Program</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-chevron-icon" size={16} />
            </div>
          </div>

          {/* 2. Class * (Multi-Select) */}
          <MultiSelectDropdown
            id="fa-class-select"
            label="Class"
            required={true}
            options={classOptions}
            selectedIds={selectedClasses}
            onChange={onClassesChange}
            placeholder={selectedProgram ? 'Select Classes' : 'Select Program first'}
            disabled={!selectedProgram && classes.length === 0}
            searchPlaceholder="Search classes..."
            itemTypeLabel="classes"
            maxDisplayCount={2}
          />

          {/* 3. Section (Multi-Select) */}
          <MultiSelectDropdown
            id="fa-section-select"
            label="Section"
            required={false}
            options={sectionOptions}
            selectedIds={selectedSections}
            onChange={onSectionsChange}
            placeholder={
              selectedClasses.length === 0
                ? 'Select Class first'
                : sectionOptions.length === 0
                  ? 'No sections'
                  : 'Select Sections (or all)'
            }
            disabled={selectedClasses.length === 0 || sectionOptions.length === 0}
            searchPlaceholder="Search sections..."
            itemTypeLabel="sections"
            maxDisplayCount={2}
          />

          {/* 4. Students * (Multi-Select) */}
          <MultiSelectDropdown
            id="fa-student-select"
            label="Students"
            required={true}
            options={studentOptions}
            selectedIds={selectedStudentIds}
            onChange={onStudentsChange}
            placeholder={
              students.length === 0
                ? selectedClasses.length === 0
                  ? 'Select Class first'
                  : 'No students found'
                : 'Select Students'
            }
            disabled={students.length === 0}
            searchPlaceholder="Search student name or roll..."
            itemTypeLabel="students"
            maxDisplayCount={1}
          />
        </div>

        {/* Bottom Actions Row matching specification */}
        <div className="choose-student-actions-row">
          <div className="actions-left-group">
            <button
              type="button"
              className="btn-clear-filters"
              onClick={onClearFilters}
            >
              Clear Filters
            </button>

            <button type="submit" className="btn-go">
              Go
              {selectedStudentIds.length > 0 && (
                <span className="btn-go-count-badge">{selectedStudentIds.length}</span>
              )}
            </button>
          </div>

          {onFillDemo && (
            <button
              type="button"
              className="btn-demo-link"
              onClick={onFillDemo}
              title="Quickly fill sample classes, sections, and multiple students"
            >
              <Sparkles size={13} style={{ marginRight: '4px' }} />
              Fill Sample (Multi-Select)
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
