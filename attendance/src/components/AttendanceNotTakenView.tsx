'use client';

import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, X } from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockClasses,
  mockSections,
} from '@/data/mockAttendanceData';
import {
  getAttendanceNotTakenList,
  exportAttendanceNotTakenToCSV,
  AttendanceNotTakenRow,
  parseDateString,
} from '@/lib/attendanceStorage';

export const AttendanceNotTakenView: React.FC = () => {
  // Form Inputs state (Date object picker strings YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>('2026-08-28');
  const [endDate, setEndDate] = useState<string>('2026-08-31');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Results State
  const [showResults, setShowResults] = useState<boolean>(false);
  const [reportHeading, setReportHeading] = useState<string>('');
  const [reportRows, setReportRows] = useState<AttendanceNotTakenRow[]>([]);

  // Popup Modal Alert State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('Date Range Error');
  const [modalMessage, setModalMessage] = useState<string>('');

  // Filtered classes based on selected program
  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : [];

  // Filtered sections based on selected class
  const availableSections = selectedClass
    ? mockSections.filter((s) => s.classId === selectedClass)
    : [];

  // Cascading Handlers
  const handleProgramChange = (progId: string) => {
    setSelectedProgram(progId);
    setSelectedClass('');
    setSelectedSection('');
    setShowResults(false);
  };

  const handleClassChange = (clsId: string) => {
    setSelectedClass(clsId);
    setSelectedSection('');
    setShowResults(false);
  };

  const handleSectionChange = (secId: string) => {
    setSelectedSection(secId);
    setShowResults(false);
  };

  const openErrorModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
    setShowResults(false); // Do not show any result when invalid
  };

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate required fields
    if (!startDate || !endDate) {
      openErrorModal('Missing Required Dates', 'Please select both Start Date and End Date.');
      return;
    }

    if (!selectedProgram) {
      openErrorModal('Missing Program', 'Please select a Program before generating the report.');
      return;
    }

    if (!selectedClass) {
      openErrorModal('Missing Class', 'Please select a Class before generating the report.');
      return;
    }

    if (!selectedSection) {
      openErrorModal('Missing Section', 'Please select a Section before generating the report.');
      return;
    }

    // 2. Validate dates
    const parsedStart = parseDateString(startDate);
    const parsedEnd = parseDateString(endDate);

    if (!parsedStart || !parsedEnd) {
      openErrorModal(
        'Invalid Date',
        'Please select valid Start Date and End Date.'
      );
      return;
    }

    // Start date must be before or equal to End date
    if (parsedStart.getTime() > parsedEnd.getTime()) {
      openErrorModal(
        'Invalid Date Range',
        'Start Date must be before or equal to End Date. Please select a valid date range.'
      );
      return;
    }

    // 3. Generate Report Data from LocalStorage/database
    const result = getAttendanceNotTakenList({
      startDateStr: startDate,
      endDateStr: endDate,
      programId: selectedProgram,
      classId: selectedClass,
      sectionId: selectedSection,
    });

    if (!result.success) {
      openErrorModal('Date Range Error', result.errorMessage || 'Unable to generate report.');
      return;
    }

    setReportHeading(result.reportHeading);
    setReportRows(result.records);
    setShowResults(true);
  };

  const handleExportExcel = () => {
    const clsObj = mockClasses.find((c) => c.id === selectedClass);
    const secObj = mockSections.find((s) => s.id === selectedSection);
    exportAttendanceNotTakenToCSV(
      reportRows,
      reportHeading,
      clsObj?.name || 'Class',
      secObj?.name || 'Section'
    );
  };

  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs */}
      <HeaderBreadcrumbs
        title="Attendance Not Taken"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance Not Taken' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Inner Sub-heading */}
        <div className="not-taken-header-row">
          <h2 className="not-taken-title">Attendance Not Taken (Session)</h2>
        </div>

        {/* Filter Form matching screenshot */}
        <form onSubmit={handleGo} className="not-taken-form">
          <div className="not-taken-form-grid">
            {/* Start Date */}
            <div className="not-taken-form-group">
              <label htmlFor="start-date" className="not-taken-label">
                Start Date <span className="required-star">*</span>
              </label>
              <div className="not-taken-input-wrapper">
                <input
                  id="start-date"
                  type="date"
                  className="not-taken-input not-taken-date-picker"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setShowResults(false);
                  }}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="not-taken-form-group">
              <label htmlFor="end-date" className="not-taken-label">
                End Date <span className="required-star">*</span>
              </label>
              <div className="not-taken-input-wrapper">
                <input
                  id="end-date"
                  type="date"
                  className="not-taken-input not-taken-date-picker"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setShowResults(false);
                  }}
                />
              </div>
            </div>

            {/* Program */}
            <div className="not-taken-form-group">
              <label htmlFor="program-select" className="not-taken-label">
                Program <span className="required-star">*</span>
              </label>
              <div className="not-taken-select-wrapper">
                <select
                  id="program-select"
                  className="not-taken-select"
                  value={selectedProgram}
                  onChange={(e) => handleProgramChange(e.target.value)}
                >
                  <option value="">Select Program</option>
                  {mockPrograms.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            {/* Class */}
            <div className="not-taken-form-group">
              <label htmlFor="class-select" className="not-taken-label">
                Class <span className="required-star">*</span>
              </label>
              <div className="not-taken-select-wrapper">
                <select
                  id="class-select"
                  className="not-taken-select"
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  disabled={!selectedProgram && availableClasses.length === 0}
                >
                  <option value="">Select Class</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            {/* Section */}
            <div className="not-taken-form-group">
              <label htmlFor="section-select" className="not-taken-label">
                Section <span className="required-star">*</span>
              </label>
              <div className="not-taken-select-wrapper">
                <select
                  id="section-select"
                  className="not-taken-select"
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={!selectedClass && availableSections.length === 0}
                >
                  <option value="">Please select...</option>
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            {/* Go Button */}
            <div className="not-taken-btn-group">
              <button type="submit" className="not-taken-btn-go">
                Go
              </button>
            </div>
          </div>

          {/* Required footnote matching screenshot */}
          <div className="not-taken-footnote">* denotes a required field</div>
        </form>

        {/* Results Region: Image 2 Display */}
        {showResults && (
          <div className="not-taken-results-container">
            {/* Report Header & Export Button Row */}
            <div className="not-taken-report-header">
              <h3 className="not-taken-report-title">{reportHeading}</h3>
              <button
                type="button"
                className="btn-export-excel"
                onClick={handleExportExcel}
              >
                Export Excel
              </button>
            </div>

            {/* Results Table matching Image 2 */}
            <div className="not-taken-table-wrapper">
              <table className="not-taken-table" aria-label="Attendance Not Taken Table">
                <thead>
                  <tr>
                    <th className="col-date">Date</th>
                    <th className="col-session">Session Session</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="not-taken-empty-row">
                        No missing attendance records for this period.
                      </td>
                    </tr>
                  ) : (
                    reportRows.map((row) => (
                      <tr key={row.dateISO} className="not-taken-data-row">
                        <td className="cell-date">{row.dateISO}</td>
                        <td className="cell-session">
                          <span className="not-taken-x-symbol">{row.sessionName}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pop-up Modal Dialog for Date Validation / Errors */}
      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-alert-card">
            <div className="modal-header modal-alert-header">
              <div className="modal-title-with-icon">
                <AlertTriangle className="modal-alert-icon" size={22} />
                <h3 className="modal-title">{modalTitle}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body modal-alert-body">
              <p className="modal-alert-message">{modalMessage}</p>
            </div>

            <div className="modal-footer modal-alert-footer">
              <button
                type="button"
                className="btn-modal-ok"
                onClick={() => setModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
