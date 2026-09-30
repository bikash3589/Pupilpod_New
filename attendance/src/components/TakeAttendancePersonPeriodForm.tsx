'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Clock,
  CheckCircle2,
  Save,
  RotateCcw,
  BookOpen,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockClasses,
  mockSections,
  mockAbsenceReasons,
} from '@/data/mockAttendanceData';
import { mockStudentsList } from '@/data/mockFutureAbsenceData';
import { AttendanceStatus, PersonPeriodRecord } from '@/types/attendance';

const initialPeriodRows: PersonPeriodRecord[] = [
  { periodNo: 1, periodName: 'Period 1', subjectName: 'Mathematics', timeRange: '08:30 - 09:15 AM', teacherName: 'Dr. Ramesh Nair', status: 'PRESENT' },
  { periodNo: 2, periodName: 'Period 2', subjectName: 'Physics (Core)', timeRange: '09:20 - 10:05 AM', teacherName: 'Ms. Anita Desai', status: 'PRESENT' },
  { periodNo: 3, periodName: 'Period 3', subjectName: 'English Literature', timeRange: '10:10 - 10:55 AM', teacherName: 'Mr. David Clark', status: 'PRESENT' },
  { periodNo: 4, periodName: 'Period 4', subjectName: 'Chemistry Lab', timeRange: '11:15 - 12:00 PM', teacherName: 'Dr. S. K. Roy', status: 'PRESENT' },
  { periodNo: 5, periodName: 'Period 5', subjectName: 'Computer Science', timeRange: '12:05 - 12:50 PM', teacherName: 'Mr. Gopichand', status: 'PRESENT' },
  { periodNo: 6, periodName: 'Period 6', subjectName: 'Biology & Life Sciences', timeRange: '01:30 - 02:15 PM', teacherName: 'Dr. Sunita Rao', status: 'PRESENT' },
  { periodNo: 7, periodName: 'Period 7', subjectName: 'Visual Arts & Design', timeRange: '02:20 - 03:05 PM', teacherName: 'Ms. Meera Sen', status: 'PRESENT' },
];

export const TakeAttendancePersonPeriodForm: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>('prog-cbse');
  const [selectedClass, setSelectedClass] = useState<string>('cls-cbse-1');
  const [selectedSection, setSelectedSection] = useState<string>('sec-cbse-1a');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-101');
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');

  const [periodRows, setPeriodRows] = useState<PersonPeriodRecord[]>(initialPeriodRows);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : [];

  const availableSections = selectedClass
    ? mockSections.filter((s) => s.classId === selectedClass)
    : [];

  const availableStudents = mockStudentsList.filter((s) => {
    if (selectedProgram && s.programId !== selectedProgram && s.programId !== 'prog-3') return false;
    return true;
  });

  const currentStudent = mockStudentsList.find((s) => s.id === selectedStudentId) || mockStudentsList[0];

  const handlePeriodStatusChange = (periodNo: number, newStatus: AttendanceStatus) => {
    setPeriodRows((prev) =>
      prev.map((p) => (p.periodNo === periodNo ? { ...p, status: newStatus } : p))
    );
  };

  const handleReasonChange = (periodNo: number, newReason: string) => {
    setPeriodRows((prev) =>
      prev.map((p) => (p.periodNo === periodNo ? { ...p, reason: newReason } : p))
    );
  };

  const handleCommentChange = (periodNo: number, newComment: string) => {
    setPeriodRows((prev) =>
      prev.map((p) => (p.periodNo === periodNo ? { ...p, comment: newComment } : p))
    );
  };

  const handleSetAll = (st: AttendanceStatus) => {
    setPeriodRows((prev) => prev.map((p) => ({ ...p, status: st })));
  };

  const handleSave = () => {
    try {
      const key = `period_attendance_${currentStudent.id}_${selectedDate}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          studentId: currentStudent.id,
          date: selectedDate,
          periods: periodRows,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error(e);
    }

    setToastMessage(`Period attendance saved successfully for ${currentStudent.firstName} ${currentStudent.lastName} on ${selectedDate}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="attendance-page-layout">
      <HeaderBreadcrumbs
        title="Attendance By Person Period Wise"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance By Person Period Wise' },
        ]}
      />

      <div className="attendance-main-card">
        <AttendanceNav />

        {/* Filter Selection Row */}
        <form onSubmit={(e) => { e.preventDefault(); setShowTable(true); }} className="attendance-filter-form mb-6">
          <div className="form-grid-row form-grid-row-1">
            <div className="form-group">
              <label className="form-label">Program <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    const newClasses = mockClasses.filter((c) => c.programId === e.target.value);
                    if (newClasses.length > 0) setSelectedClass(newClasses[0].id);
                  }}
                >
                  {mockPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Class <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Section <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Student <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {availableStudents.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.rollNo} - {std.firstName} {std.lastName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          <div className="form-grid-row form-grid-row-2 mt-4">
            <div className="form-group">
              <label className="form-label">Date <span className="required-star">*</span></label>
              <input
                type="text"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className="form-actions-group">
              <button type="submit" className="btn-go">
                Go
              </button>
            </div>
          </div>
        </form>

        {toastMessage && (
          <div className="save-toast-banner mb-6" role="status">
            <CheckCircle2 size={18} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Period Table View */}
        {showTable && (
          <div className="period-attendance-container">
            <div className="grid-toolbar">
              <div className="toolbar-left">
                <span className="toolbar-label">Quick Set All Periods:</span>
                <div className="btn-group-pill">
                  <button
                    type="button"
                    className="btn-quick-status btn-quick-present"
                    onClick={() => handleSetAll('PRESENT')}
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    className="btn-quick-status btn-quick-absent"
                    onClick={() => handleSetAll('ABSENT')}
                  >
                    All Absent
                  </button>
                </div>
              </div>

              <div className="toolbar-right">
                <button
                  type="button"
                  className="btn-toolbar-primary"
                  onClick={handleSave}
                >
                  <Save size={16} />
                  <span>Save Period Attendance</span>
                </button>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="attendance-table" aria-label="Student period roster">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Period</th>
                    <th style={{ width: '130px' }}>Time</th>
                    <th style={{ width: '220px' }}>Subject & Teacher</th>
                    <th style={{ width: '260px' }}>Status</th>
                    <th style={{ minWidth: '180px' }}>Absence Reason</th>
                    <th style={{ minWidth: '180px' }}>Period Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {periodRows.map((period) => {
                    const isAbsentOrLate = period.status === 'ABSENT' || period.status === 'LATE';
                    return (
                      <tr key={period.periodNo} className={`roster-row ${period.status === 'ABSENT' ? 'row-absent' : ''}`}>
                        <td className="font-semibold text-center">{period.periodName}</td>
                        <td className="text-muted font-mono">{period.timeRange}</td>
                        <td>
                          <div>
                            <div className="font-medium text-slate-800">{period.subjectName}</div>
                            <div className="text-xs text-muted">{period.teacherName}</div>
                          </div>
                        </td>
                        <td>
                          <div className="status-button-group">
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-present ${period.status === 'PRESENT' ? 'selected' : ''}`}
                              onClick={() => handlePeriodStatusChange(period.periodNo, 'PRESENT')}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-absent ${period.status === 'ABSENT' ? 'selected' : ''}`}
                              onClick={() => handlePeriodStatusChange(period.periodNo, 'ABSENT')}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-late ${period.status === 'LATE' ? 'selected' : ''}`}
                              onClick={() => handlePeriodStatusChange(period.periodNo, 'LATE')}
                            >
                              L
                            </button>
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-excused ${period.status === 'EXCUSED' ? 'selected' : ''}`}
                              onClick={() => handlePeriodStatusChange(period.periodNo, 'EXCUSED')}
                            >
                              E
                            </button>
                          </div>
                        </td>
                        <td>
                          {isAbsentOrLate ? (
                            <select
                              className="table-input-select"
                              value={period.reason || ''}
                              onChange={(e) => handleReasonChange(period.periodNo, e.target.value)}
                            >
                              <option value="">Select reason...</option>
                              {mockAbsenceReasons.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-muted-dash">-</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input-text"
                            placeholder="Add note for this period..."
                            value={period.comment || ''}
                            onChange={(e) => handleCommentChange(period.periodNo, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
