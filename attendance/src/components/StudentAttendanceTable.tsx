'use client';

import React, { useState } from 'react';
import {
  StudentAttendanceRow,
  AttendanceStatus,
} from '../types/attendance';
import { mockAbsenceReasons } from '../data/mockAttendanceData';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Send,
  Save,
  RotateCcw,
  Download,
  Users,
  UserCheck,
  UserX,
  BellRing,
} from 'lucide-react';

interface StudentAttendanceTableProps {
  roster: StudentAttendanceRow[];
  searchQuery: string;
  onSave: (rows: StudentAttendanceRow[], notifyParents: boolean) => void;
  onReset: () => void;
  sectionName: string;
  classNameStr: string;
  dateStr: string;
  sessionName: string;
}

export const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  roster: initialRoster,
  searchQuery,
  onSave,
  onReset,
  sectionName,
  classNameStr,
  dateStr,
  sessionName,
}) => {
  const [rows, setRows] = useState<StudentAttendanceRow[]>(initialRoster);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showSaveToast, setShowSaveToast] = useState<string | null>(null);

  // Sync when initialRoster updates
  React.useEffect(() => {
    setRows(initialRoster);
    setHasUnsavedChanges(false);
  }, [initialRoster]);

  // Filter rows based on search input
  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${r.student.firstName} ${r.student.lastName}`.toLowerCase();
    const roll = r.student.rollNo.toLowerCase();
    const adm = r.student.admissionNo.toLowerCase();
    return fullName.includes(query) || roll.includes(query) || adm.includes(query);
  });

  // Calculate status counts
  const total = rows.length;
  const presentCount = rows.filter((r) => r.status === 'PRESENT').length;
  const absentCount = rows.filter((r) => r.status === 'ABSENT').length;
  const lateCount = rows.filter((r) => r.status === 'LATE').length;
  const excusedCount = rows.filter((r) => r.status === 'EXCUSED').length;
  const halfDayCount = rows.filter((r) => r.status === 'HALF_DAY').length;

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.student.id === studentId) {
          const autoNotify = newStatus === 'ABSENT' || newStatus === 'LATE';
          return {
            ...row,
            status: newStatus,
            notifyParent: autoNotify ? row.notifyParent : false,
            isDirty: true,
          };
        }
        return row;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.student.id === studentId) {
          return { ...row, reason, isDirty: true };
        }
        return row;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.student.id === studentId) {
          return { ...row, comment, isDirty: true };
        }
        return row;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleNotifyToggle = (studentId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.student.id === studentId) {
          return { ...row, notifyParent: !row.notifyParent, isDirty: true };
        }
        return row;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSetAll = (status: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        status,
        notifyParent: status === 'ABSENT',
        isDirty: true,
      }))
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveAttendance = (notify: boolean) => {
    onSave(rows, notify);
    setHasUnsavedChanges(false);
    setShowSaveToast(
      notify
        ? `Attendance saved successfully and notifications queued for ${absentCount + lateCount} students!`
        : `Attendance saved successfully for ${total} students!`
    );
    setTimeout(() => setShowSaveToast(null), 5000);
  };

  const getStatusBadgeClass = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'badge-present';
      case 'ABSENT':
        return 'badge-absent';
      case 'LATE':
        return 'badge-late';
      case 'EXCUSED':
        return 'badge-excused';
      case 'HALF_DAY':
        return 'badge-halfday';
      default:
        return 'badge-unrecorded';
    }
  };

  return (
    <div className="attendance-grid-container">
      {/* Toast Notification */}
      {showSaveToast && (
        <div className="save-toast-banner" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{showSaveToast}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setShowSaveToast(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Overview Statistics Banner */}
      <div className="stats-kpi-bar">
        <div className="stat-pill stat-total">
          <Users size={16} />
          <span>Total: <strong>{total}</strong></span>
        </div>
        <div className="stat-pill stat-present">
          <UserCheck size={16} />
          <span>Present: <strong>{presentCount}</strong> ({total > 0 ? Math.round((presentCount / total) * 100) : 0}%)</span>
        </div>
        <div className="stat-pill stat-absent">
          <UserX size={16} />
          <span>Absent: <strong>{absentCount}</strong></span>
        </div>
        <div className="stat-pill stat-late">
          <Clock size={16} />
          <span>Late: <strong>{lateCount}</strong></span>
        </div>
        <div className="stat-pill stat-excused">
          <HelpCircle size={16} />
          <span>Excused: <strong>{excusedCount}</strong></span>
        </div>
        {halfDayCount > 0 && (
          <div className="stat-pill stat-halfday">
            <span>Half Day: <strong>{halfDayCount}</strong></span>
          </div>
        )}
      </div>

      {/* Grid Action Toolbar */}
      <div className="grid-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">Quick Set All:</span>
          <div className="btn-group-pill">
            <button
              type="button"
              className="btn-quick-status btn-quick-present"
              onClick={() => handleSetAll('PRESENT')}
              title="Mark all students as Present"
            >
              All Present
            </button>
            <button
              type="button"
              className="btn-quick-status btn-quick-absent"
              onClick={() => handleSetAll('ABSENT')}
              title="Mark all students as Absent"
            >
              All Absent
            </button>
            <button
              type="button"
              className="btn-quick-status btn-quick-late"
              onClick={() => handleSetAll('LATE')}
              title="Mark all students as Late"
            >
              All Late
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          {hasUnsavedChanges && (
            <span className="unsaved-badge">
              <AlertCircle size={14} /> Unsaved changes
            </span>
          )}

          <button
            type="button"
            className="btn-toolbar-secondary"
            onClick={onReset}
            title="Reset changes back to initial state"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="btn-toolbar-primary"
            onClick={() => handleSaveAttendance(false)}
            title="Save attendance records"
          >
            <Save size={15} />
            <span>Save Attendance</span>
          </button>

          <button
            type="button"
            className="btn-toolbar-accent"
            onClick={() => handleSaveAttendance(true)}
            title="Save attendance and queue SMS/Email notifications to parents of absent students"
          >
            <BellRing size={15} />
            <span>Save & Notify</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="table-responsive-wrapper">
        <table className="attendance-table" aria-label="Student attendance roster">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Roll</th>
              <th style={{ width: '110px' }}>Adm No</th>
              <th style={{ width: '220px' }}>Student Name</th>
              <th style={{ width: '260px' }}>Status</th>
              <th style={{ minWidth: '180px' }}>Reason (if Absent/Late)</th>
              <th style={{ minWidth: '180px' }}>Comment / Notes</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Notify</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Recent 5 Days</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-search-cell">
                  No students found matching &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isAbsentOrLate = row.status === 'ABSENT' || row.status === 'LATE';
                const studentInitials = `${row.student.firstName.charAt(0)}${row.student.lastName.charAt(0)}`;

                return (
                  <tr
                    key={row.student.id}
                    className={`roster-row ${row.isDirty ? 'row-dirty' : ''} ${row.status === 'ABSENT' ? 'row-absent' : ''}`}
                  >
                    {/* Roll No */}
                    <td className="cell-roll font-semibold">{row.student.rollNo}</td>

                    {/* Adm No */}
                    <td className="cell-adm text-muted">{row.student.admissionNo}</td>

                    {/* Student Name */}
                    <td className="cell-student">
                      <div className="student-profile-cell">
                        <span className={`student-avatar avatar-${row.student.gender.toLowerCase()}`}>
                          {studentInitials}
                        </span>
                        <div className="student-info">
                          <span className="student-name">
                            {row.student.firstName} {row.student.lastName}
                          </span>
                          <span className="student-gender text-muted">
                            {row.student.gender === 'MALE' ? 'Male' : 'Female'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Options */}
                    <td className="cell-status">
                      <div className="status-button-group" role="group" aria-label="Attendance status">
                        <button
                          type="button"
                          className={`btn-status-toggle btn-st-present ${row.status === 'PRESENT' ? 'selected' : ''}`}
                          onClick={() => handleStatusChange(row.student.id, 'PRESENT')}
                          title="Mark Present"
                        >
                          P
                        </button>
                        <button
                          type="button"
                          className={`btn-status-toggle btn-st-absent ${row.status === 'ABSENT' ? 'selected' : ''}`}
                          onClick={() => handleStatusChange(row.student.id, 'ABSENT')}
                          title="Mark Absent"
                        >
                          A
                        </button>
                        <button
                          type="button"
                          className={`btn-status-toggle btn-st-late ${row.status === 'LATE' ? 'selected' : ''}`}
                          onClick={() => handleStatusChange(row.student.id, 'LATE')}
                          title="Mark Late"
                        >
                          L
                        </button>
                        <button
                          type="button"
                          className={`btn-status-toggle btn-st-excused ${row.status === 'EXCUSED' ? 'selected' : ''}`}
                          onClick={() => handleStatusChange(row.student.id, 'EXCUSED')}
                          title="Mark Excused"
                        >
                          E
                        </button>
                        <button
                          type="button"
                          className={`btn-status-toggle btn-st-halfday ${row.status === 'HALF_DAY' ? 'selected' : ''}`}
                          onClick={() => handleStatusChange(row.student.id, 'HALF_DAY')}
                          title="Mark Half Day"
                        >
                          HD
                        </button>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="cell-reason">
                      {isAbsentOrLate ? (
                        <select
                          className="table-input-select"
                          value={row.reason || ''}
                          onChange={(e) => handleReasonChange(row.student.id, e.target.value)}
                        >
                          <option value="">Select reason...</option>
                          {mockAbsenceReasons.map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-muted-dash">-</span>
                      )}
                    </td>

                    {/* Comment */}
                    <td className="cell-comment">
                      <input
                        type="text"
                        className="table-input-text"
                        placeholder="Add note..."
                        value={row.comment || ''}
                        onChange={(e) => handleCommentChange(row.student.id, e.target.value)}
                      />
                    </td>

                    {/* Notify checkbox */}
                    <td className="cell-notify" style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="notify-checkbox"
                        checked={row.notifyParent}
                        disabled={!isAbsentOrLate}
                        onChange={() => handleNotifyToggle(row.student.id)}
                        title={isAbsentOrLate ? 'Send notification to parent' : 'Only available for Absent or Late'}
                      />
                    </td>

                    {/* 5-day History Strip */}
                    <td className="cell-history" style={{ textAlign: 'center' }}>
                      <div className="history-dots-wrapper">
                        {row.history.map((h, i) => (
                          <span
                            key={i}
                            className={`history-dot dot-${h.status.toLowerCase()}`}
                            title={`${h.date}: ${h.status}`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="grid-footer">
        <span className="footer-context-text">
          Showing <strong>{filteredRows.length}</strong> of <strong>{total}</strong> students in {classNameStr || 'Selected Class'} - {sectionName || 'Selected Section'} ({sessionName || 'Session'})
        </span>
        <div className="footer-legend">
          <span className="legend-item"><span className="legend-box box-p">P</span> Present</span>
          <span className="legend-item"><span className="legend-box box-a">A</span> Absent</span>
          <span className="legend-item"><span className="legend-box box-l">L</span> Late</span>
          <span className="legend-item"><span className="legend-box box-e">E</span> Excused</span>
          <span className="legend-item"><span className="legend-box box-hd">HD</span> Half Day</span>
        </div>
      </div>
    </div>
  );
};
