'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ArrowUp,
  ArrowUpDown,
  SquarePen,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  Check,
  PlusCircle,
  BellRing,
  Users,
  UserX,
  UserCheck,
} from 'lucide-react';
import { SetFutureAbsenceForm } from './SetFutureAbsenceForm';
import {
  mockPrograms,
  mockClasses,
  mockSections,
} from '../data/mockAttendanceData';
import {
  mockStudentsList,
  mockFutureAbsenceReasons,
  initialFutureAbsences,
} from '../data/mockFutureAbsenceData';
import { FutureAbsenceRecord } from '../types/attendance';

export const FutureAbsenceManager: React.FC = () => {
  // Multi-select filter states
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Workspace visibility state
  const [showWorkspace, setShowWorkspace] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Future Absence records state
  const [futureAbsences, setFutureAbsences] = useState<FutureAbsenceRecord[]>(initialFutureAbsences);

  // New Absence Entry Form state
  const [fromDate, setFromDate] = useState<string>('29/09/2026');
  const [toDate, setToDate] = useState<string>('29/09/2026');
  const [selectedSession, setSelectedSession] = useState<string>('Full Day Session');
  const [selectedReason, setSelectedReason] = useState<string>('Sick / Medical Illness');
  const [remarks, setRemarks] = useState<string>('');
  const [notifyParent, setNotifyParent] = useState<boolean>(true);

  // Table controls state
  const [pageSize, setPageSize] = useState<number>(25);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FutureAbsenceRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal Form State
  const [modalFromDate, setModalFromDate] = useState<string>('');
  const [modalToDate, setModalToDate] = useState<string>('');
  const [modalSession, setModalSession] = useState<string>('');
  const [modalReason, setModalReason] = useState<string>('');
  const [modalRemarks, setModalRemarks] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<FutureAbsenceRecord['status']>('Upcoming');
  const [modalNotifyParent, setModalNotifyParent] = useState<boolean>(true);

  // Filtered classes based on selected program
  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : mockClasses;

  // Filtered sections based on selected classes
  const availableSections = selectedClasses.length > 0
    ? mockSections.filter((s) => selectedClasses.includes(s.classId))
    : selectedProgram
    ? mockSections.filter((s) => availableClasses.some((c) => c.id === s.classId))
    : mockSections;

  // Filtered students based on program, classes, and sections
  const availableStudents = mockStudentsList.filter((std) => {
    if (selectedProgram && std.programId !== selectedProgram) return false;
    if (selectedClasses.length > 0 && !selectedClasses.includes(std.classId)) return false;
    if (selectedSections.length > 0 && !selectedSections.includes(std.sectionId)) return false;
    return true;
  });

  // Selected student objects
  const selectedStudents = mockStudentsList.filter((s) => selectedStudentIds.includes(s.id));
  const currentStudent = selectedStudents[0]; // fallback for single-student preview

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handlers for cascading selections
  const handleProgramChange = (progId: string) => {
    setSelectedProgram(progId);
    setSelectedClasses([]);
    setSelectedSections([]);
    setSelectedStudentIds([]);
    setShowWorkspace(false);
    setValidationError(null);
  };

  const handleClassesChange = (classIds: string[]) => {
    setSelectedClasses(classIds);
    // Prune selected sections that no longer belong to selected classes
    if (classIds.length > 0) {
      const validSectionIds = new Set(
        mockSections.filter((s) => classIds.includes(s.classId)).map((s) => s.id)
      );
      setSelectedSections((prev) => prev.filter((id) => validSectionIds.has(id)));
    } else {
      setSelectedSections([]);
    }

    // Prune selected students that no longer belong to selected classes
    if (classIds.length > 0) {
      const validStudentIds = new Set(
        mockStudentsList.filter((std) => classIds.includes(std.classId)).map((s) => s.id)
      );
      setSelectedStudentIds((prev) => prev.filter((id) => validStudentIds.has(id)));
    } else {
      setSelectedStudentIds([]);
    }

    setValidationError(null);
  };

  const handleSectionsChange = (secIds: string[]) => {
    setSelectedSections(secIds);
    // Prune selected students if specific sections are chosen
    if (secIds.length > 0) {
      const validStudentIds = new Set(
        mockStudentsList.filter((std) => secIds.includes(std.sectionId)).map((s) => s.id)
      );
      setSelectedStudentIds((prev) => prev.filter((id) => validStudentIds.has(id)));
    }
    setValidationError(null);
  };

  const handleStudentsChange = (studentIds: string[]) => {
    setSelectedStudentIds(studentIds);
    setValidationError(null);
  };

  const handleClearFilters = () => {
    setSelectedProgram('');
    setSelectedClasses([]);
    setSelectedSections([]);
    setSelectedStudentIds([]);
    setShowWorkspace(false);
    setValidationError(null);
    setRemarks('');
  };

  const handleFillDemo = () => {
    const prog = mockPrograms.find((p) => p.code === 'SEC') || mockPrograms[2];
    const cls9 = mockClasses.find((c) => c.code === 'G9') || mockClasses[8];
    const cls10 = mockClasses.find((c) => c.code === 'G10') || mockClasses[9];
    const sec9a = mockSections.find((s) => s.classId === cls9.id) || mockSections[10];
    const sec10a = mockSections.find((s) => s.classId === cls10.id) || mockSections[12];
    const sec10b = mockSections.find((s) => s.classId === cls10.id && s.name === 'Section B') || mockSections[13];

    setSelectedProgram(prog.id);
    setSelectedClasses([cls9.id, cls10.id]);
    setSelectedSections([sec9a.id, sec10a.id, sec10b.id]);

    // Select 3 sample students
    setSelectedStudentIds(['std-101', 'std-102', 'std-106']);

    setFromDate('29/09/2026');
    setToDate('30/09/2026');
    setSelectedSession('Full Day Session');
    setSelectedReason('Sick / Medical Illness');
    setRemarks('Doctor consultation and advised 2 days medical rest for students.');
    setShowWorkspace(true);
    setValidationError(null);
    showToast('Sample multi-selection loaded (2 classes, 3 sections, 3 students).');
  };

  const handleGo = () => {
    if (!selectedProgram) {
      setValidationError('Please select a Program before clicking Go.');
      return;
    }

    if (selectedClasses.length === 0) {
      setValidationError('Please select at least one Class before clicking Go.');
      return;
    }

    if (selectedStudentIds.length === 0) {
      setValidationError('Please select at least one Student from the dropdown before clicking Go.');
      return;
    }

    setValidationError(null);
    setShowWorkspace(true);
  };

  // Remove individual student from selection in workspace
  const handleRemoveStudentFromSelection = (studentId: string) => {
    const updated = selectedStudentIds.filter((id) => id !== studentId);
    setSelectedStudentIds(updated);
    if (updated.length === 0) {
      showToast('All students removed from selection.');
    }
  };

  // Preset Date helpers
  const handleSetDatesPreset = (daysAhead: number, durationDays: number = 1) => {
    const today = new Date(2026, 8, 28); // 28 Sep 2026
    const start = new Date(today);
    start.setDate(today.getDate() + daysAhead);

    const end = new Date(start);
    end.setDate(start.getDate() + (durationDays - 1));

    const formatD = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    setFromDate(formatD(start));
    setToDate(formatD(end));
  };

  // Submit new Future Absence (Batch for all selected students)
  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      showToast('Please provide both From Date and To Date.');
      return;
    }

    if (selectedStudents.length === 0) {
      setValidationError('Please select at least one student before saving.');
      return;
    }

    const newRecords: FutureAbsenceRecord[] = selectedStudents.map((std, idx) => {
      const stdProgObj = mockPrograms.find((p) => p.id === std.programId);
      const stdClassObj = mockClasses.find((c) => c.id === std.classId);
      const stdSectionObj = mockSections.find((s) => s.id === std.sectionId);

      return {
        id: `fa-${Date.now()}-${idx}`,
        slNo: futureAbsences.length + idx + 1,
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        admissionNo: std.admissionNo,
        rollNo: std.rollNo,
        program: stdProgObj?.name || 'Secondary School',
        className: stdClassObj?.name || 'Grade 10',
        section: stdSectionObj?.name || 'Section A',
        fromDate,
        toDate,
        session: selectedSession,
        reason: selectedReason,
        remarks: remarks.trim() || undefined,
        notifyParent,
        status: 'Upcoming',
        recordedBy: 'Teacher Incharge',
        recordedAt: 'Today, 03:30 PM',
      };
    });

    setFutureAbsences((prev) => [...newRecords, ...prev]);
    showToast(
      `Future absence scheduled for ${selectedStudents.length} student${
        selectedStudents.length > 1 ? 's' : ''
      } (${fromDate} - ${toDate}).`
    );

    setRemarks('');
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: FutureAbsenceRecord) => {
    setEditingRecord(rec);
    setModalFromDate(rec.fromDate);
    setModalToDate(rec.toDate);
    setModalSession(rec.session);
    setModalReason(rec.reason);
    setModalRemarks(rec.remarks || '');
    setModalStatus(rec.status);
    setModalNotifyParent(rec.notifyParent);
    setIsEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setFutureAbsences((prev) =>
      prev.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              fromDate: modalFromDate,
              toDate: modalToDate,
              session: modalSession,
              reason: modalReason,
              remarks: modalRemarks,
              status: modalStatus,
              notifyParent: modalNotifyParent,
            }
          : r
      )
    );

    setIsEditModalOpen(false);
    showToast(`Future absence record for ${editingRecord.studentName} updated.`);
  };

  // Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setFutureAbsences((prev) => prev.filter((r) => r.id !== deletingId));
    setDeletingId(null);
    showToast('Future absence record cancelled and removed.');
  };

  // Filter table data
  const filteredRecords = futureAbsences.filter((rec) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      rec.studentName.toLowerCase().includes(q) ||
      rec.rollNo.toLowerCase().includes(q) ||
      rec.admissionNo.toLowerCase().includes(q) ||
      rec.className.toLowerCase().includes(q) ||
      rec.section.toLowerCase().includes(q) ||
      rec.reason.toLowerCase().includes(q) ||
      rec.status.toLowerCase().includes(q) ||
      rec.fromDate.includes(q) ||
      rec.toDate.includes(q)
    );
  });

  const totalEntries = filteredRecords.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  // Summary labels for multi-selection
  const selectedClassNames = selectedClasses
    .map((id) => mockClasses.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const selectedSectionNames = selectedSections
    .map((id) => mockSections.find((s) => s.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="future-absence-container">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="save-toast-banner" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Filter Form: Choose Students (Multi-Selection for Class, Section, and Students) */}
      <SetFutureAbsenceForm
        programs={mockPrograms}
        classes={availableClasses}
        sections={availableSections}
        students={availableStudents}
        selectedProgram={selectedProgram}
        selectedClasses={selectedClasses}
        selectedSections={selectedSections}
        selectedStudentIds={selectedStudentIds}
        onProgramChange={handleProgramChange}
        onClassesChange={handleClassesChange}
        onSectionsChange={handleSectionsChange}
        onStudentsChange={handleStudentsChange}
        onClearFilters={handleClearFilters}
        onGo={handleGo}
        onFillDemo={handleFillDemo}
      />

      {/* Validation Error Banner */}
      {validationError && (
        <div className="validation-error-alert" role="alert">
          <span>{validationError}</span>
        </div>
      )}

      {/* Workspace Region: Shown when Go is clicked */}
      {showWorkspace && (
        <div className="future-absence-workspace">
          {/* Target Profile Card: Handles single or multi-students */}
          {selectedStudents.length === 1 && currentStudent ? (
            <div className="target-profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar-box">
                  <div className="avatar-initials">
                    {`${currentStudent.firstName[0]}${currentStudent.lastName[0]}`}
                  </div>
                </div>

                <div className="profile-details-col">
                  <div className="profile-title-row">
                    <h3 className="profile-name">
                      {currentStudent.firstName} {currentStudent.lastName}
                    </h3>
                    <span className="profile-badge-active">Active Enrollment</span>
                  </div>

                  <div className="profile-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Roll Number:</span>
                      <span className="meta-value">{currentStudent.rollNo}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Admission No:</span>
                      <span className="meta-value">{currentStudent.admissionNo}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Class & Section:</span>
                      <span className="meta-value">
                        {mockClasses.find((c) => c.id === currentStudent.classId)?.name} -{' '}
                        {mockSections.find((s) => s.id === currentStudent.sectionId)?.name}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Parent Contact:</span>
                      <span className="meta-value">
                        {currentStudent.phone} • {currentStudent.parentEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedStudents.length > 1 ? (
            <div className="multi-target-profile-card">
              <div className="multi-profile-header">
                <div className="multi-profile-title-group">
                  <div className="multi-profile-icon-box">
                    <Users size={22} className="users-icon" />
                  </div>
                  <div>
                    <div className="multi-profile-title-row">
                      <h3 className="profile-name">
                        Selected Students ({selectedStudents.length} Students)
                      </h3>
                      <span className="profile-badge-active">
                        Batch Absence Scheduling
                      </span>
                    </div>
                    <div className="multi-profile-meta-chips">
                      <span className="meta-chip">
                        Classes: {selectedClassNames.join(', ') || 'All Selected'}
                      </span>
                      {selectedSectionNames.length > 0 && (
                        <span className="meta-chip">
                          Sections: {selectedSectionNames.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="multi-profile-actions">
                  <span className="selection-counter-badge">
                    {selectedStudents.length} Students Included
                  </span>
                </div>
              </div>

              {/* Selected Student Chips / Mini Cards Grid */}
              <div className="selected-students-grid">
                {selectedStudents.map((std) => {
                  const stdClass = mockClasses.find((c) => c.id === std.classId);
                  const stdSec = mockSections.find((s) => s.id === std.sectionId);
                  return (
                    <div key={std.id} className="selected-student-chip-card">
                      <div className="chip-avatar">
                        {std.firstName[0]}
                        {std.lastName[0]}
                      </div>
                      <div className="chip-info">
                        <span className="chip-name">
                          {std.firstName} {std.lastName}
                        </span>
                        <span className="chip-sub">
                          Roll: {std.rollNo} • {stdClass?.name} ({stdSec?.name})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleRemoveStudentFromSelection(std.id)}
                        title={`Remove ${std.firstName} from schedule`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-selection-card">
              <UserX size={24} className="empty-icon" />
              <span>No students currently selected. Please choose students from the dropdown above.</span>
            </div>
          )}

          {/* Form Card: Set Future Absence Details */}
          {selectedStudents.length > 0 && (
            <div className="future-schedule-card">
              <div className="schedule-card-header">
                <h3 className="schedule-card-title">
                  <Calendar size={18} className="title-icon" />
                  <span>
                    Specify Absence Schedule & Reason for{' '}
                    <strong>
                      {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}
                    </strong>
                  </span>
                </h3>

                {/* Quick Date Presets */}
                <div className="quick-presets-group">
                  <span className="presets-label">Quick Presets:</span>
                  <button
                    type="button"
                    className="btn-preset-pill"
                    onClick={() => handleSetDatesPreset(1, 1)}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    className="btn-preset-pill"
                    onClick={() => handleSetDatesPreset(1, 3)}
                  >
                    3 Days
                  </button>
                  <button
                    type="button"
                    className="btn-preset-pill"
                    onClick={() => handleSetDatesPreset(7, 5)}
                  >
                    Next Week (5 Days)
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveAbsence} className="schedule-form">
                <div className="schedule-fields-grid">
                  {/* From Date */}
                  <div className="form-group">
                    <label htmlFor="sch-from-date" className="form-label">
                      From Date <span className="required-star">*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        id="sch-from-date"
                        type="text"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        required
                      />
                    </div>
                  </div>

                  {/* To Date */}
                  <div className="form-group">
                    <label htmlFor="sch-to-date" className="form-label">
                      To Date <span className="required-star">*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        id="sch-to-date"
                        type="text"
                        className="form-control"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        required
                      />
                    </div>
                  </div>

                  {/* Session */}
                  <div className="form-group">
                    <label htmlFor="sch-session" className="form-label">
                      Session / Duration <span className="required-star">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="sch-session"
                        className="form-control form-select"
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                      >
                        <option value="Full Day Session">Full Day Session</option>
                        <option value="Session 1 (Morning)">Session 1 (Morning)</option>
                        <option value="Session 2 (Afternoon)">Session 2 (Afternoon)</option>
                      </select>
                      <ChevronDown className="select-chevron-icon" size={16} />
                    </div>
                  </div>

                  {/* Absence Reason */}
                  <div className="form-group">
                    <label htmlFor="sch-reason" className="form-label">
                      Absence Reason <span className="required-star">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="sch-reason"
                        className="form-control form-select"
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                      >
                        {mockFutureAbsenceReasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="select-chevron-icon" size={16} />
                    </div>
                  </div>
                </div>

                {/* Remarks / Parent Note */}
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label htmlFor="sch-remarks" className="form-label">
                    Remarks / Leave Note / Approval Reference
                  </label>
                  <textarea
                    id="sch-remarks"
                    className="form-control schedule-textarea"
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter details regarding leave request, doctor note, or parental consent..."
                  />
                </div>

                {/* Checkbox: Notify Parent */}
                <div className="notify-parent-row">
                  <label className="checkbox-custom-label">
                    <input
                      type="checkbox"
                      checked={notifyParent}
                      onChange={(e) => setNotifyParent(e.target.checked)}
                    />
                    <div className="checkbox-label-content">
                      <span className="checkbox-main-text">
                        <BellRing size={15} className="bell-icon" />
                        Send Automated SMS & Email Notification to Parents
                      </span>
                      <span className="checkbox-sub-text">
                        Parents of all {selectedStudents.length} selected student{selectedStudents.length > 1 ? 's' : ''} will receive schedule confirmation and absence acknowledgment.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="schedule-form-actions">
                  <button
                    type="button"
                    className="btn-schedule-reset"
                    onClick={() => {
                      setFromDate('29/09/2026');
                      setToDate('29/09/2026');
                      setSelectedSession('Full Day Session');
                      setSelectedReason('Sick / Medical Illness');
                      setRemarks('');
                    }}
                  >
                    Reset Form
                  </button>

                  <button type="submit" className="btn-schedule-save">
                    <Check size={16} />
                    <span>
                      Save Future Absence for {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Scheduled Future Absences Table Section */}
      <div className="future-records-section">
        <div className="records-header-bar">
          <div className="records-title-group">
            <h3 className="records-heading">Scheduled Future Absences</h3>
            <span className="records-count-pill">
              {futureAbsences.length} Records
            </span>
          </div>

          <div className="records-right-actions">
            <button
              type="button"
              className="btn-quick-add-link"
              onClick={handleFillDemo}
              title="Add sample future absence"
            >
              <PlusCircle size={15} />
              <span>Quick Schedule Example</span>
            </button>
          </div>
        </div>

        {/* Table Controls (Show N entries, Search input) */}
        <div className="records-controls-row">
          <div className="page-size-selector">
            <span>Show</span>
            <div className="select-wrapper select-wrapper-inline">
              <select
                id="future-page-size"
                className="form-control inline-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="select-chevron-icon" size={14} />
            </div>
            <span>entries</span>
          </div>

          <div className="records-search-wrapper">
            <label htmlFor="future-table-search">Search:</label>
            <input
              id="future-table-search"
              type="text"
              className="form-control inline-search-input"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student, roll, class..."
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive-wrapper future-table-wrapper">
          <table className="future-data-table" aria-label="Future Absences Table">
            <thead>
              <tr>
                <th className="col-sl">
                  <div className="th-content">
                    <span>SI.No</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Student Name</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Roll No / Adm</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Class & Section</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>From Date</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>To Date</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Session</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Reason</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Status</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>SMS / Notify</span>
                    <ArrowUpDown size={13} className="sort-icon" />
                  </div>
                </th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="empty-table-row">
                    No future absence records found.
                  </td>
                </tr>
              ) : (
                filteredRecords
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <tr key={item.id} className="future-table-row">
                      <td className="col-sl">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="col-student-name">
                        <strong>{item.studentName}</strong>
                      </td>
                      <td className="col-meta">
                        <span className="roll-badge">{item.rollNo}</span>
                        <span className="adm-text">{item.admissionNo}</span>
                      </td>
                      <td>
                        {item.className} - {item.section}
                      </td>
                      <td className="col-date">{item.fromDate}</td>
                      <td className="col-date">{item.toDate}</td>
                      <td>
                        <span className="session-badge">{item.session}</span>
                      </td>
                      <td>
                        <span className="reason-text">{item.reason}</span>
                        {item.remarks && (
                          <span className="remarks-tooltip" title={item.remarks}>
                            {' '}
                            (Note)
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-pill status-${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.notifyParent ? (
                          <span className="notify-yes">
                            <Check size={13} /> Yes
                          </span>
                        ) : (
                          <span className="notify-no">No</span>
                        )}
                      </td>
                      <td className="col-actions">
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="btn-action-icon edit-action-btn"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit future absence record"
                          >
                            <SquarePen size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon delete-action-btn"
                            onClick={() => setDeletingId(item.id)}
                            title="Cancel / Delete absence schedule"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination / Footer */}
        <div className="records-footer-row">
          <div className="entries-info">
            Showing {startIndex} to {endIndex} of {totalEntries} entries
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn-pagination-nav"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-number-active">{currentPage}</span>
            <button
              type="button"
              className="btn-pagination-nav"
              onClick={() =>
                setCurrentPage((p) =>
                  p * pageSize < totalEntries ? p + 1 : p
                )
              }
              disabled={currentPage * pageSize >= totalEntries}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Future Absence Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-container future-edit-modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Future Absence Record</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="modal-body-form">
              {/* Readonly Student Info Header */}
              <div className="modal-student-summary">
                <div className="summary-col">
                  <span className="summary-label">Student:</span>
                  <span className="summary-val">{editingRecord.studentName}</span>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Roll / Adm:</span>
                  <span className="summary-val">
                    {editingRecord.rollNo} / {editingRecord.admissionNo}
                  </span>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Class:</span>
                  <span className="summary-val">
                    {editingRecord.className} - {editingRecord.section}
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="modal-fields-grid">
                <div className="form-group">
                  <label className="form-label">
                    From Date <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalFromDate}
                    onChange={(e) => setModalFromDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    To Date <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalToDate}
                    onChange={(e) => setModalToDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session</label>
                  <select
                    className="form-control form-select"
                    value={modalSession}
                    onChange={(e) => setModalSession(e.target.value)}
                  >
                    <option value="Full Day Session">Full Day Session</option>
                    <option value="Session 1 (Morning)">Session 1 (Morning)</option>
                    <option value="Session 2 (Afternoon)">Session 2 (Afternoon)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control form-select"
                    value={modalStatus}
                    onChange={(e) =>
                      setModalStatus(e.target.value as FutureAbsenceRecord['status'])
                    }
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Applied">Applied</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Reason</label>
                <select
                  className="form-control form-select"
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                >
                  {mockFutureAbsenceReasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Remarks / Note</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                />
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-custom-label">
                  <input
                    type="checkbox"
                    checked={modalNotifyParent}
                    onChange={(e) => setModalNotifyParent(e.target.checked)}
                  />
                  <span>Send SMS / Email updates to parents upon changes</span>
                </label>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Cancel Confirmation Modal */}
      {deletingId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-container delete-confirm-modal">
            <div className="modal-header">
              <h3 className="modal-title">Cancel Future Absence</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingId(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="delete-modal-body">
              <div className="warning-icon-box">
                <AlertTriangle size={32} className="warning-triangle" />
              </div>
              <div className="warning-text-box">
                <p className="warning-main-msg">
                  Are you sure you want to cancel this scheduled future absence? The student will be expected in class and normal attendance rules will apply.
                </p>
                <p className="warning-sub-msg">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeletingId(null)}
              >
                Keep Absence
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleDeleteConfirm}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
