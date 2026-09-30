'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Users,
  Save,
  RotateCcw,
  CheckCircle2,
  BellRing,
  UserCheck,
  UserX,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockRollGroups,
  mockSessions,
  mockAbsenceReasons,
  generateMockRoster,
} from '@/data/mockAttendanceData';
import { StudentAttendanceRow, AttendanceStatus } from '@/types/attendance';

export const TakeAttendanceRollGroupForm: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>('prog-3');
  const [selectedRollGroupId, setSelectedRollGroupId] = useState<string>('rg-10a');
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');
  const [selectedSession, setSelectedSession] = useState<string>('ses-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showRoster, setShowRoster] = useState<boolean>(true);
  const [roster, setRoster] = useState<StudentAttendanceRow[]>(generateMockRoster('sec-a'));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableRollGroups = selectedProgram
    ? mockRollGroups.filter((rg) => rg.programId === selectedProgram)
    : mockRollGroups;

  const currentRollGroup = mockRollGroups.find((rg) => rg.id === selectedRollGroupId) || mockRollGroups[0];

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
      const key = `rollgroup_attendance_${currentRollGroup.id}_${selectedDate}_${selectedSession}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          rollGroupId: currentRollGroup.id,
          date: selectedDate,
          session: selectedSession,
          rows: roster,
          savedAt: new Date().toISOString(),
          savedBy: 'Tutor / Admin',
        })
      );
    } catch (e) {
      console.error(e);
    }

    setToastMessage(
      notify
        ? `Roll group attendance saved for ${currentRollGroup.name} and notifications queued for ${absentCount} absent students!`
        : `Roll group attendance saved successfully for ${currentRollGroup.name}!`
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="attendance-page-layout">
      <HeaderBreadcrumbs
        title="Attendance By Roll Group"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance By Roll Group' },
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
                    const newRGs = mockRollGroups.filter((rg) => rg.programId === e.target.value);
                    if (newRGs.length > 0) setSelectedRollGroupId(newRGs[0].id);
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
              <label className="form-label">Roll Group / Homeroom <span className="required-star">*</span></label>
              <div className="select-wrapper">
                <select
                  className="form-control form-select"
                  value={selectedRollGroupId}
                  onChange={(e) => setSelectedRollGroupId(e.target.value)}
                >
                  {availableRollGroups.map((rg) => (
                    <option key={rg.id} value={rg.id}>
                      {rg.name} ({rg.tutorName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

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
          </div>

          <div className="form-grid-row form-grid-row-2 mt-4">
            <div className="form-group search-group">
              <label className="form-label">Search in Roll Group</label>
              <input
                type="text"
                className="form-control form-input"
                placeholder="Search by student name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="form-actions-group">
              <button type="submit" className="btn-go">
                Load Roll Group
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

        {/* Roster Table */}
        {showRoster && (
          <div className="attendance-grid-container">
            {/* Stats bar */}
            <div className="stats-kpi-bar">
              <div className="stat-pill stat-total">
                <Users size={16} />
                <span>Roll Group: <strong>{currentRollGroup?.name}</strong> (Tutor: {currentRollGroup?.tutorName})</span>
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
                  <span>Save Attendance</span>
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
                    <th style={{ minWidth: '180px' }}>Tutor Remarks</th>
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
                            placeholder="Add remarks..."
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
