'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  BookOpen,
  Save,
  RotateCcw,
  CheckCircle2,
  BellRing,
  UserCheck,
  UserX,
  Clock,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockClasses,
  mockSections,
  mockSubjects,
  mockSessions,
  mockAbsenceReasons,
  generateMockRoster,
} from '@/data/mockAttendanceData';
import { StudentAttendanceRow, AttendanceStatus } from '@/types/attendance';

export const TakeAttendanceSubjectForm: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>('prog-3');
  const [selectedClass, setSelectedClass] = useState<string>('cls-10');
  const [selectedSection, setSelectedSection] = useState<string>('sec-a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-math');
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');
  const [selectedSession, setSelectedSession] = useState<string>('ses-1');
  const [topicCovered, setTopicCovered] = useState<string>('Chapter 4: Quadratic Equations & Roots');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showRoster, setShowRoster] = useState<boolean>(true);
  const [roster, setRoster] = useState<StudentAttendanceRow[]>(generateMockRoster('sec-a'));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : [];

  const availableSections = selectedClass
    ? mockSections.filter((s) => s.classId === selectedClass)
    : [];

  const currentSubject = mockSubjects.find((s) => s.id === selectedSubjectId) || mockSubjects[0];

  const filteredRoster = roster.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${r.student.firstName} ${r.student.lastName}`.toLowerCase();
    return name.includes(q) || r.student.rollNo.includes(q) || r.student.admissionNo.includes(q);
  });

  const total = roster.length;
  const presentCount = roster.filter((r) => r.status === 'PRESENT').length;
  const absentCount = roster.filter((r) => r.status === 'ABSENT').length;
  const lateCount = roster.filter((r) => r.status === 'LATE').length;

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((r) => {
        if (r.student.id === studentId) {
          return {
            ...r,
            status: newStatus,
            notifyParent: (newStatus === 'ABSENT' || newStatus === 'LATE') ? r.notifyParent : false,
            isDirty: true,
          };
        }
        return r;
      })
    );
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setRoster((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, reason, isDirty: true } : r))
    );
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setRoster((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, comment, isDirty: true } : r))
    );
  };

  const handleNotifyToggle = (studentId: string) => {
    setRoster((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, notifyParent: !r.notifyParent, isDirty: true } : r))
    );
  };

  const handleSetAll = (st: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((r) => ({
        ...r,
        status: st,
        notifyParent: st === 'ABSENT',
        isDirty: true,
      }))
    );
  };

  const handleSave = (notify: boolean) => {
    try {
      const key = `subject_attendance_${currentSubject.id}_${selectedSection}_${selectedDate}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          subjectId: currentSubject.id,
          sectionId: selectedSection,
          date: selectedDate,
          topicCovered,
          rows: roster,
          savedAt: new Date().toISOString(),
          savedBy: currentSubject.teacherName || 'Subject Teacher',
        })
      );
    } catch (e) {
      console.error(e);
    }

    setToastMessage(
      notify
        ? `Subject attendance saved for ${currentSubject.name} and notifications queued for ${absentCount} absent students!`
        : `Subject attendance saved successfully for ${currentSubject.name}!`
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="attendance-page-layout">
      <HeaderBreadcrumbs
        title="Attendance By Subject"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance By Subject' },
        ]}
      />

      <div className="attendance-main-card">
        <AttendanceNav />

        {/* Filter Selection Row */}
        <form onSubmit={(e) => { e.preventDefault(); setShowRoster(true); }} className="attendance-filter-form mb-6">
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
              <label className="form-label">Subject <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {mockSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.teacherName})
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

            <div className="form-group">
              <label className="form-label">Topic / Lesson Notes</label>
              <input
                type="text"
                className="form-control"
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                placeholder="e.g. Chapter 4: Quadratic Equations..."
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

        {/* Subject Roster Table */}
        {showRoster && (
          <div className="attendance-grid-container">
            {/* Stats bar */}
            <div className="stats-kpi-bar">
              <div className="stat-pill stat-total">
                <BookOpen size={16} />
                <span>Subject: <strong>{currentSubject?.name}</strong> ({currentSubject?.teacherName})</span>
              </div>
              <div className="stat-pill stat-present">
                <UserCheck size={16} />
                <span>Present: <strong>{presentCount}</strong> / {total}</span>
              </div>
              <div className="stat-pill stat-absent">
                <UserX size={16} />
                <span>Absent: <strong>{absentCount}</strong></span>
              </div>
              <div className="stat-pill stat-late">
                <Clock size={16} />
                <span>Late: <strong>{lateCount}</strong></span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="grid-toolbar">
              <div className="toolbar-left">
                <span className="toolbar-label">Quick Set All:</span>
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
                  onClick={() => handleSave(false)}
                >
                  <Save size={15} />
                  <span>Save Subject Attendance</span>
                </button>
                <button
                  type="button"
                  className="btn-toolbar-accent"
                  onClick={() => handleSave(true)}
                >
                  <BellRing size={15} />
                  <span>Save & Notify</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Roll</th>
                    <th style={{ width: '110px' }}>Adm No</th>
                    <th style={{ width: '220px' }}>Student Name</th>
                    <th style={{ width: '260px' }}>Status</th>
                    <th style={{ minWidth: '180px' }}>Reason (if Absent/Late)</th>
                    <th style={{ minWidth: '180px' }}>Subject Teacher Notes</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Notify</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((row) => {
                    const isAbsentOrLate = row.status === 'ABSENT' || row.status === 'LATE';
                    return (
                      <tr key={row.student.id} className={`roster-row ${row.status === 'ABSENT' ? 'row-absent' : ''}`}>
                        <td className="font-semibold">{row.student.rollNo}</td>
                        <td className="text-muted">{row.student.admissionNo}</td>
                        <td>
                          <div className="student-profile-cell">
                            <span className="student-avatar avatar-male">
                              {row.student.firstName.charAt(0)}{row.student.lastName.charAt(0)}
                            </span>
                            <span className="student-name">
                              {row.student.firstName} {row.student.lastName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="status-button-group">
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-present ${row.status === 'PRESENT' ? 'selected' : ''}`}
                              onClick={() => handleStatusChange(row.student.id, 'PRESENT')}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-absent ${row.status === 'ABSENT' ? 'selected' : ''}`}
                              onClick={() => handleStatusChange(row.student.id, 'ABSENT')}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-late ${row.status === 'LATE' ? 'selected' : ''}`}
                              onClick={() => handleStatusChange(row.student.id, 'LATE')}
                            >
                              L
                            </button>
                            <button
                              type="button"
                              className={`btn-status-toggle btn-st-excused ${row.status === 'EXCUSED' ? 'selected' : ''}`}
                              onClick={() => handleStatusChange(row.student.id, 'EXCUSED')}
                            >
                              E
                            </button>
                          </div>
                        </td>
                        <td>
                          {isAbsentOrLate ? (
                            <select
                              className="table-input-select"
                              value={row.reason || ''}
                              onChange={(e) => handleReasonChange(row.student.id, e.target.value)}
                            >
                              <option value="">Select reason...</option>
                              {mockAbsenceReasons.map((reason) => (
                                <option key={reason} value={reason}>{reason}</option>
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
                            placeholder="Add lesson remarks..."
                            value={row.comment || ''}
                            onChange={(e) => handleCommentChange(row.student.id, e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={row.notifyParent}
                            disabled={!isAbsentOrLate}
                            onChange={() => handleNotifyToggle(row.student.id)}
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
