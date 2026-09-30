'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  BookOpen,
  User,
  Users,
  Layers,
} from 'lucide-react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import {
  mockPrograms,
  mockClasses,
  mockSections,
  mockTimetableSlots,
  mockAbsenceReasons,
  generateMockRoster,
} from '@/data/mockAttendanceData';
import { TimetablePeriodSlot, StudentAttendanceRow, AttendanceStatus } from '@/types/attendance';

export const TakeAttendanceTimetableForm: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>('prog-3');
  const [selectedClass, setSelectedClass] = useState<string>('cls-10');
  const [selectedSection, setSelectedSection] = useState<string>('sec-a');
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');

  const [timetableSlots, setTimetableSlots] = useState<TimetablePeriodSlot[]>(mockTimetableSlots);
  const [activeSlot, setActiveSlot] = useState<TimetablePeriodSlot | null>(mockTimetableSlots[0]);
  const [slotRoster, setSlotRoster] = useState<StudentAttendanceRow[]>(generateMockRoster('sec-a'));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : [];

  const availableSections = selectedClass
    ? mockSections.filter((s) => s.classId === selectedClass)
    : [];

  const handleSelectSlot = (slot: TimetablePeriodSlot) => {
    if (slot.status === 'BREAK') return;
    setActiveSlot(slot);
    setSlotRoster(generateMockRoster(selectedSection));
  };

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setSlotRoster((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, status: newStatus, isDirty: true } : r))
    );
  };

  const handleSaveSlotAttendance = () => {
    if (!activeSlot) return;
    const present = slotRoster.filter((r) => r.status === 'PRESENT').length;

    // Update timetable slot state
    setTimetableSlots((prev) =>
      prev.map((s) =>
        s.id === activeSlot.id
          ? {
              ...s,
              status: 'TAKEN',
              presentCount: present,
              recordedBy: 'Teacher / Staff',
              recordedAt: 'Just now',
            }
          : s
      )
    );

    // Save to localStorage
    try {
      const key = `timetable_attendance_${activeSlot.id}_${selectedDate}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          slotId: activeSlot.id,
          subject: activeSlot.subjectName,
          date: selectedDate,
          presentCount: present,
          rows: slotRoster,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error(e);
    }

    setToastMessage(`Attendance for ${activeSlot.periodName} (${activeSlot.subjectName}) saved successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="attendance-page-layout">
      <HeaderBreadcrumbs
        title="Attendance By TimeTable"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance By TimeTable' },
        ]}
      />

      <div className="attendance-main-card">
        <AttendanceNav />

        {/* Filter Selection Row */}
        <form onSubmit={(e) => e.preventDefault()} className="attendance-filter-form mb-6">
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
              <label className="form-label">Date <span className="required-star">*</span></label>
              <input
                type="text"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>
        </form>

        {toastMessage && (
          <div className="save-toast-banner mb-6" role="status">
            <CheckCircle2 size={18} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Timetable Interactive Grid */}
        <div className="timetable-interactive-container">
          <h3 className="timetable-heading">Daily Timetable Schedule ({selectedDate})</h3>
          <div className="timetable-slots-scroll-row">
            {timetableSlots.map((slot) => {
              const isSelected = activeSlot?.id === slot.id;
              const isBreak = slot.status === 'BREAK';
              const isTaken = slot.status === 'TAKEN';

              return (
                <div
                  key={slot.id}
                  className={`timetable-slot-card ${isBreak ? 'slot-break' : ''} ${isSelected ? 'slot-active' : ''} ${isTaken ? 'slot-taken' : ''}`}
                  onClick={() => handleSelectSlot(slot)}
                  role={isBreak ? undefined : 'button'}
                  tabIndex={isBreak ? undefined : 0}
                >
                  <div className="slot-time-header">
                    <span className="slot-period-badge">{slot.periodName}</span>
                    <span className="slot-time-range">{slot.startTime}</span>
                  </div>

                  <div className="slot-subject-title">{slot.subjectName}</div>
                  {!isBreak && (
                    <>
                      <div className="slot-teacher-text">{slot.teacherName}</div>
                      <div className="slot-room-badge">{slot.roomNo}</div>
                      <div className="slot-status-indicator">
                        {isTaken ? (
                          <span className="status-taken-chip">
                            ✓ Taken ({slot.presentCount}/{slot.totalStudents || 28})
                          </span>
                        ) : (
                          <span className="status-pending-chip">⚠ Not Taken</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Period Roster Marking Drawer/Section */}
          {activeSlot && activeSlot.status !== 'BREAK' && (
            <div className="active-slot-marking-region mt-6">
              <div className="grid-toolbar">
                <div className="toolbar-left">
                  <span className="font-semibold text-slate-800">
                    Marking for {activeSlot.periodName}: <strong>{activeSlot.subjectName}</strong> ({activeSlot.teacherName} - {activeSlot.roomNo})
                  </span>
                </div>

                <div className="toolbar-right">
                  <button
                    type="button"
                    className="btn-toolbar-primary"
                    onClick={handleSaveSlotAttendance}
                  >
                    <Save size={15} />
                    <span>Save {activeSlot.periodName} Attendance</span>
                  </button>
                </div>
              </div>

              <div className="table-responsive-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Roll</th>
                      <th style={{ width: '110px' }}>Adm No</th>
                      <th style={{ width: '220px' }}>Student Name</th>
                      <th style={{ width: '260px' }}>Status</th>
                      <th style={{ minWidth: '180px' }}>Reason (if Absent/Late)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotRoster.map((row) => {
                      const isAbsentOrLate = row.status === 'ABSENT' || row.status === 'LATE';
                      return (
                        <tr key={row.student.id} className={`roster-row ${row.status === 'ABSENT' ? 'row-absent' : ''}`}>
                          <td className="font-semibold">{row.student.rollNo}</td>
                          <td className="text-muted">{row.student.admissionNo}</td>
                          <td className="font-medium">
                            {row.student.firstName} {row.student.lastName}
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
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSlotRoster((prev) =>
                                    prev.map((r) => (r.student.id === row.student.id ? { ...r, reason: val } : r))
                                  );
                                }}
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
    </div>
  );
};
