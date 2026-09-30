'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  User,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Clock,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockClasses,
  mockSections,
  mockSessions,
  mockAbsenceReasons,
} from '@/data/mockAttendanceData';
import { mockStudentsList } from '@/data/mockFutureAbsenceData';
import { AttendanceStatus } from '@/types/attendance';

export const TakeAttendanceByPersonForm: React.FC = () => {
  // Filters
  const [selectedProgram, setSelectedProgram] = useState<string>('prog-cbse');
  const [selectedClass, setSelectedClass] = useState<string>('cls-cbse-1');
  const [selectedSection, setSelectedSection] = useState<string>('sec-cbse-1a');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-101');
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');
  const [selectedSession, setSelectedSession] = useState<string>('ses-1');

  // Attendance Form Values
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [notifyParent, setNotifyParent] = useState<boolean>(false);
  const [showWorkspace, setShowWorkspace] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available options
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

  // Mock student history
  const historyDays = [
    { date: '19/09', day: 'Fri', status: 'PRESENT' as AttendanceStatus },
    { date: '20/09', day: 'Sat', status: 'PRESENT' as AttendanceStatus },
    { date: '22/09', day: 'Mon', status: 'PRESENT' as AttendanceStatus },
    { date: '23/09', day: 'Tue', status: 'LATE' as AttendanceStatus },
    { date: '24/09', day: 'Wed', status: 'PRESENT' as AttendanceStatus },
    { date: '25/09', day: 'Thu', status: status },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage
    try {
      const key = `person_attendance_${currentStudent.id}_${selectedDate}_${selectedSession}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          studentId: currentStudent.id,
          date: selectedDate,
          session: selectedSession,
          status,
          reason,
          comment,
          notifyParent,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error(err);
    }

    setToastMessage(
      notifyParent
        ? `Attendance saved for ${currentStudent.firstName} ${currentStudent.lastName} and notification queued!`
        : `Attendance saved successfully for ${currentStudent.firstName} ${currentStudent.lastName}!`
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleStatusChange = (newStatus: AttendanceStatus) => {
    setStatus(newStatus);
    if (newStatus === 'ABSENT' || newStatus === 'LATE') {
      setNotifyParent(true);
    } else {
      setNotifyParent(false);
      setReason('');
    }
  };

  return (
    <div className="attendance-page-layout">
      <HeaderBreadcrumbs
        title="Attendance By Person"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance By Person' },
        ]}
      />

      <div className="attendance-main-card">
        <AttendanceNav />

        {/* Filter Selection Row */}
        <form onSubmit={(e) => { e.preventDefault(); setShowWorkspace(true); }} className="attendance-filter-form mb-6">
          <div className="form-grid-row form-grid-row-1">
            {/* Program */}
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

            {/* Class */}
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

            {/* Section */}
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

            {/* Student */}
            <div className="form-group">
              <label className="form-label">Select Student <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {availableStudents.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.rollNo} - {std.firstName} {std.lastName} ({std.admissionNo})
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          <div className="form-grid-row form-grid-row-2 mt-4">
            {/* Date */}
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

            {/* Session */}
            <div className="form-group session-group">
              <label className="form-label">Session <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  {mockSessions.map((ses) => (
                    <option key={ses.id} value={ses.id}>{ses.name}</option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            <div className="form-actions-group">
              <button type="submit" className="btn-go">
                Load Student
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

        {/* Student Workspace */}
        {showWorkspace && currentStudent && (
          <div className="student-person-marking-workspace">
            {/* Profile Overview Card */}
            <div className="person-profile-header-card">
              <div className="person-profile-main">
                <div className="person-avatar-circle">
                  {currentStudent.firstName.charAt(0)}{currentStudent.lastName.charAt(0)}
                </div>
                <div className="person-info-block">
                  <h3 className="person-name">
                    {currentStudent.firstName} {currentStudent.lastName}
                  </h3>
                  <div className="person-badges-row">
                    <span className="person-chip">Roll: <strong>{currentStudent.rollNo}</strong></span>
                    <span className="person-chip">Adm: <strong>{currentStudent.admissionNo}</strong></span>
                    <span className="person-chip">Gender: <strong>{currentStudent.gender}</strong></span>
                  </div>
                </div>
              </div>

              <div className="person-contacts-block">
                <div className="contact-item">
                  <Mail size={14} className="contact-icon" />
                  <span>{currentStudent.parentEmail || 'parent@example.com'}</span>
                </div>
                <div className="contact-item">
                  <Phone size={14} className="contact-icon" />
                  <span>{currentStudent.phone || '+91 98765 43210'}</span>
                </div>
              </div>
            </div>

            {/* Attendance Marking Editor */}
            <div className="person-attendance-editor-card">
              <h4 className="editor-card-heading">
                Record Attendance for {selectedDate} ({mockSessions.find((s) => s.id === selectedSession)?.name || 'Session 1'})
              </h4>

              <div className="person-status-picker-row">
                <label className="picker-label">Select Attendance Status:</label>
                <div className="status-button-group">
                  <button
                    type="button"
                    className={`btn-status-toggle btn-st-present ${status === 'PRESENT' ? 'selected' : ''}`}
                    onClick={() => handleStatusChange('PRESENT')}
                  >
                    Present (P)
                  </button>
                  <button
                    type="button"
                    className={`btn-status-toggle btn-st-absent ${status === 'ABSENT' ? 'selected' : ''}`}
                    onClick={() => handleStatusChange('ABSENT')}
                  >
                    Absent (A)
                  </button>
                  <button
                    type="button"
                    className={`btn-status-toggle btn-st-late ${status === 'LATE' ? 'selected' : ''}`}
                    onClick={() => handleStatusChange('LATE')}
                  >
                    Late (L)
                  </button>
                  <button
                    type="button"
                    className={`btn-status-toggle btn-st-excused ${status === 'EXCUSED' ? 'selected' : ''}`}
                    onClick={() => handleStatusChange('EXCUSED')}
                  >
                    Excused (E)
                  </button>
                  <button
                    type="button"
                    className={`btn-status-toggle btn-st-halfday ${status === 'HALF_DAY' ? 'selected' : ''}`}
                    onClick={() => handleStatusChange('HALF_DAY')}
                  >
                    Half Day (HD)
                  </button>
                </div>
              </div>

              {/* Dynamic Fields for Absent/Late */}
              {(status === 'ABSENT' || status === 'LATE') && (
                <div className="person-reason-row">
                  <div className="form-group">
                    <label className="form-label">Absence Reason</label>
                    <div className="select-wrapper">
                      <select
                        className="form-control form-select"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      >
                        <option value="">Select reason...</option>
                        {mockAbsenceReasons.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown className="select-chevron-icon" size={16} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comments / Doctor Note</label>
                    <input
                      type="text"
                      className="form-control"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add notes for records..."
                    />
                  </div>
                </div>
              )}

              {/* Notification Toggle */}
              <div className="person-notify-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifyParent}
                    onChange={(e) => setNotifyParent(e.target.checked)}
                  />
                  <span>Send instant SMS / WhatsApp alert to parent ({currentStudent.parentEmail || currentStudent.phone})</span>
                </label>
              </div>

              {/* Actions */}
              <div className="person-editor-actions">
                <button
                  type="button"
                  className="btn-toolbar-primary"
                  onClick={handleSave}
                >
                  <Save size={16} />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>

            {/* 6-Day Recent Attendance History Strip */}
            <div className="person-history-card">
              <h4 className="editor-card-heading">Recent Attendance History</h4>
              <div className="person-history-strip">
                {historyDays.map((item, idx) => (
                  <div key={idx} className={`history-day-card card-status-${item.status.toLowerCase()}`}>
                    <span className="history-date-label">{item.date}</span>
                    <span className="history-day-name">{item.day}</span>
                    <span className={`history-status-badge badge-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
