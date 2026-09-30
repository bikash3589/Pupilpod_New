'use client';

import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, X, Calendar, UserCheck, UserX, Clock } from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockClasses,
  mockSections,
} from '@/data/mockAttendanceData';
import {
  getAttendanceSummaryByDateList,
  exportAttendanceSummaryByDateToCSV,
  AttendanceSummaryByDateRow,
  parseDateString,
} from '@/lib/attendanceStorage';

export const AttendanceSummaryByDateView: React.FC = () => {
  // Form Inputs state (Date object picker strings YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>('2026-08-28');
  const [endDate, setEndDate] = useState<string>('2026-08-31');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Results State
  const [showResults, setShowResults] = useState<boolean>(false);
  const [reportHeading, setReportHeading] = useState<string>('');
  const [reportRows, setReportRows] = useState<AttendanceSummaryByDateRow[]>([]);
  const [totals, setTotals] = useState<{
    totalDays: number;
    avgPercentage: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalExcused: number;
  }>({
    totalDays: 0,
    avgPercentage: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalExcused: 0,
  });

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

  const handleClearFilters = () => {
    setStartDate('2026-08-28');
    setEndDate('2026-08-31');
    setSelectedProgram('');
    setSelectedClass('');
    setSelectedSection('');
    setShowResults(false);
  };

  const openErrorModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
    setShowResults(false);
  };

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate required fields
    if (!startDate || !endDate) {
      openErrorModal('Missing Required Dates', 'Please select both Start Date and End Date.');
      return;
    }

    if (!selectedProgram) {
      openErrorModal('Missing Program', 'Please select a Program before generating the summary.');
      return;
    }

    if (!selectedClass) {
      openErrorModal('Missing Class', 'Please select a Class before generating the summary.');
      return;
    }

    if (!selectedSection) {
      openErrorModal('Missing Section', 'Please select a Section before generating the summary.');
      return;
    }

    // 2. Validate dates
    const parsedStart = parseDateString(startDate);
    const parsedEnd = parseDateString(endDate);

    if (!parsedStart || !parsedEnd) {
      openErrorModal('Invalid Date', 'Please select valid Start Date and End Date.');
      return;
    }

    if (parsedStart.getTime() > parsedEnd.getTime()) {
      openErrorModal(
        'Invalid Date Range',
        'Start Date must be before or equal to End Date. Please select a valid date range.'
      );
      return;
    }

    // 3. Generate Summary Report Data
    const result = getAttendanceSummaryByDateList({
      startDateStr: startDate,
      endDateStr: endDate,
      programId: selectedProgram,
      classId: selectedClass,
      sectionId: selectedSection,
    });

    if (!result.success) {
      openErrorModal('Date Range Error', result.errorMessage || 'Unable to generate summary.');
      return;
    }

    setReportHeading(result.reportHeading);
    setReportRows(result.records);
    setTotals(result.totals);
    setShowResults(true);
  };

  const handleExportExcel = () => {
    const clsObj = mockClasses.find((c) => c.id === selectedClass);
    const secObj = mockSections.find((s) => s.id === selectedSection);
    exportAttendanceSummaryByDateToCSV(
      reportRows,
      reportHeading,
      clsObj?.name || 'Class',
      secObj?.name || 'Section'
    );
  };

  const currentClassObj = mockClasses.find((c) => c.id === selectedClass);
  const currentSectionObj = mockSections.find((s) => s.id === selectedSection);

  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs */}
      <HeaderBreadcrumbs
        title="Attendance Summary by Date"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance Summary by Date' },
        ]}
      />

      {/* Main White Card */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Choose Date Form matching screenshot */}
        <div className="choose-date-section">
          <h2 className="choose-date-heading">Choose Date</h2>

          <form onSubmit={handleGo} className="choose-date-form">
            {/* Row 1: Start Date */}
            <div className="choose-date-row">
              <div className="choose-date-label-cell">
                <label htmlFor="summary-start-date" className="choose-date-label">
                  Start Date <span className="required-star">*</span>
                </label>
                <span className="choose-date-format-hint">Format: dd/mm/yyyy</span>
              </div>
              <div className="choose-date-input-cell">
                <input
                  id="summary-start-date"
                  type="date"
                  className="choose-date-input not-taken-date-picker"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setShowResults(false);
                  }}
                />
              </div>
            </div>

            {/* Row 2: End Date */}
            <div className="choose-date-row">
              <div className="choose-date-label-cell">
                <label htmlFor="summary-end-date" className="choose-date-label">
                  End Date <span className="required-star">*</span>
                </label>
                <span className="choose-date-format-hint">Format: dd/mm/yyyy</span>
              </div>
              <div className="choose-date-input-cell">
                <input
                  id="summary-end-date"
                  type="date"
                  className="choose-date-input not-taken-date-picker"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setShowResults(false);
                  }}
                />
              </div>
            </div>

            {/* Row 3: Program */}
            <div className="choose-date-row">
              <div className="choose-date-label-cell">
                <label htmlFor="summary-program-select" className="choose-date-label">
                  Program <span className="required-star">*</span>
                </label>
              </div>
              <div className="choose-date-input-cell">
                <select
                  id="summary-program-select"
                  className="choose-date-select"
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

            {/* Row 4: Class */}
            <div className="choose-date-row">
              <div className="choose-date-label-cell">
                <label htmlFor="summary-class-select" className="choose-date-label">
                  Class <span className="required-star">*</span>
                </label>
              </div>
              <div className="choose-date-input-cell">
                <select
                  id="summary-class-select"
                  className="choose-date-select"
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

            {/* Row 5: Section */}
            <div className="choose-date-row">
              <div className="choose-date-label-cell">
                <label htmlFor="summary-section-select" className="choose-date-label">
                  Section <span className="required-star">*</span>
                </label>
              </div>
              <div className="choose-date-input-cell">
                <select
                  id="summary-section-select"
                  className="choose-date-select"
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={!selectedClass && availableSections.length === 0}
                >
                  <option value="">Select Section</option>
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            {/* Bottom Row: Footnote + Actions */}
            <div className="choose-date-bottom-row">
              <div className="choose-date-footnote">* denotes a required field</div>
              <div className="choose-date-actions">
                <button
                  type="button"
                  className="btn-clear-filters-link"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
                <button type="submit" className="btn-choose-date-go">
                  Go
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Region */}
        {showResults && (
          <div className="not-taken-results-container">
            {/* KPI Summary Cards */}
            <div className="stats-kpi-bar mb-4">
              <div className="stat-pill stat-total">
                <Calendar size={16} />
                <span>Total Days: <strong>{totals.totalDays}</strong></span>
              </div>
              <div className="stat-pill stat-present">
                <UserCheck size={16} />
                <span>Avg Attendance: <strong>{totals.avgPercentage}%</strong></span>
              </div>
              <div className="stat-pill stat-present">
                <span>Total Present: <strong>{totals.totalPresent}</strong></span>
              </div>
              <div className="stat-pill stat-absent">
                <UserX size={16} />
                <span>Total Absent: <strong>{totals.totalAbsent}</strong></span>
              </div>
              <div className="stat-pill stat-late">
                <Clock size={16} />
                <span>Total Late: <strong>{totals.totalLate}</strong></span>
              </div>
            </div>

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

            {/* Results Table */}
            <div className="not-taken-table-wrapper">
              <table className="not-taken-table" aria-label="Attendance Summary by Date Table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Date</th>
                    <th style={{ width: '120px' }}>Day</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Total Students</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Present</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Absent</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Late</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Excused</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Attendance %</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="not-taken-empty-row">
                        No attendance records found for this period.
                      </td>
                    </tr>
                  ) : (
                    reportRows.map((row) => {
                      const isGood = row.percentage >= 90;
                      const isAverage = row.percentage >= 75 && row.percentage < 90;
                      return (
                        <tr key={row.dateISO} className="not-taken-data-row">
                          <td className="cell-date font-medium">{row.dateISO}</td>
                          <td className="text-muted">{row.dayName}</td>
                          <td style={{ textAlign: 'center' }}>{row.totalStudents}</td>
                          <td style={{ textAlign: 'center' }} className="font-semibold text-emerald-700">
                            {row.presentCount}
                          </td>
                          <td style={{ textAlign: 'center' }} className={row.absentCount > 0 ? 'font-semibold text-rose-600' : 'text-muted'}>
                            {row.absentCount}
                          </td>
                          <td style={{ textAlign: 'center' }} className={row.lateCount > 0 ? 'text-amber-600' : 'text-muted'}>
                            {row.lateCount}
                          </td>
                          <td style={{ textAlign: 'center' }} className="text-muted">
                            {row.excusedCount}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              isGood ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              isAverage ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {row.percentage}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="status-taken-chip">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="not-taken-table-footer">
              <span>
                Showing summary for <strong>{currentClassObj?.name || 'Selected Class'}</strong> - <strong>{currentSectionObj?.name || 'Selected Section'}</strong> across {totals.totalDays} school days.
              </span>
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
