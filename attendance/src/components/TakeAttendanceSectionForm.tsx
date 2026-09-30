'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AcademicProgram,
  AcademicClass,
  AcademicSection,
  AttendanceSession,
} from '../types/attendance';

interface TakeAttendanceSectionFormProps {
  programs: AcademicProgram[];
  classes: AcademicClass[];
  sections: AcademicSection[];
  sessions: AttendanceSession[];
  selectedProgram: string;
  selectedClass: string;
  selectedSection: string;
  selectedDate: string;
  selectedSession: string;
  searchQuery: string;
  onProgramChange: (val: string) => void;
  onClassChange: (val: string) => void;
  onSectionChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onSessionChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onClearFilters: () => void;
  onGo: () => void;
  onFillDemo?: () => void;
  isLockedDate?: boolean;
}

export const TakeAttendanceSectionForm: React.FC<TakeAttendanceSectionFormProps> = ({
  programs,
  classes,
  sections,
  sessions,
  selectedProgram,
  selectedClass,
  selectedSection,
  selectedDate,
  selectedSession,
  searchQuery,
  onProgramChange,
  onClassChange,
  onSectionChange,
  onDateChange,
  onSessionChange,
  onSearchChange,
  onClearFilters,
  onGo,
  onFillDemo,
  isLockedDate = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGo();
  };

  return (
    <form className="attendance-filter-form" onSubmit={handleSubmit}>
      {/* Row 1: Program, Class, Section, Date */}
      <div className="form-grid-row form-grid-row-1">
        {/* Program */}
        <div className="form-group">
          <label htmlFor="program-select" className="form-label">
            Program <span className="required-star">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="program-select"
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

        {/* Class */}
        <div className="form-group">
          <label htmlFor="class-select" className="form-label">
            Class <span className="required-star">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="class-select"
              className="form-control form-select"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              disabled={!selectedProgram && classes.length === 0}
            >
              <option value="">{selectedProgram ? 'Select Class' : ''}</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-chevron-icon" size={16} />
          </div>
        </div>

        {/* Section */}
        <div className="form-group">
          <label htmlFor="section-select" className="form-label">
            Section <span className="required-star">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="section-select"
              className="form-control form-select"
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={!selectedClass && sections.length === 0}
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-chevron-icon" size={16} />
          </div>
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date-input" className="form-label">
            Date <span className="required-star">*</span>
          </label>
          <div className="date-input-wrapper">
            <input
              id="date-input"
              type="text"
              className="form-control form-input"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
          {isLockedDate && (
            <span className="field-hint text-warning">
              This date is locked for editing.
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Session, Search, Clear Filters, Go */}
      <div className="form-grid-row form-grid-row-2">
        {/* Session */}
        <div className="form-group session-group">
          <label htmlFor="session-select" className="form-label">
            Session <span className="required-star">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="session-select"
              className="form-control form-select"
              value={selectedSession}
              onChange={(e) => onSessionChange(e.target.value)}
            >
              <option value="">Select Session</option>
              {sessions.map((ses) => (
                <option key={ses.id} value={ses.id}>
                  {ses.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-chevron-icon" size={16} />
          </div>
        </div>

        {/* Search */}
        <div className="form-group search-group">
          <label htmlFor="search-input" className="form-label">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            className="form-control form-input search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder=""
          />
        </div>

        {/* Buttons */}
        <div className="form-actions-group">
          {onFillDemo && (
            <button
              type="button"
              className="btn-demo-link"
              onClick={onFillDemo}
              title="Quickly fill sample inputs for testing"
            >
              Fill Sample
            </button>
          )}

          <button
            type="button"
            className="btn-clear-filters"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>

          <button type="submit" className="btn-go">
            Go
          </button>
        </div>
      </div>
    </form>
  );
};
