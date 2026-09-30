'use client';

import React, { useState } from 'react';
import { ChevronDown, ArrowUp, ArrowUpDown, SquarePen, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { BlockedAttendanceDate } from '../types/attendance';
import { mockPrograms, mockClasses, mockSections } from '../data/mockAttendanceData';

export const BlockedAttendanceManager: React.FC = () => {
  // Filter form state
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Table state (defaults to empty as in screenshot)
  const [blockedDates, setBlockedDates] = useState<BlockedAttendanceDate[]>([]);
  const [pageSize, setPageSize] = useState<number>(25);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BlockedAttendanceDate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal form fields
  const [modalName, setModalName] = useState<string>('');
  const [modalProgram, setModalProgram] = useState<string>('All Programs');
  const [modalClass, setModalClass] = useState<string>('All Classes');
  const [modalSection, setModalSection] = useState<string>('All Sections');
  const [modalType, setModalType] = useState<string>('School Holiday');
  const [modalFromDate, setModalFromDate] = useState<string>('26/09/2026');
  const [modalToDate, setModalToDate] = useState<string>('26/09/2026');
  const [modalReason, setModalReason] = useState<string>('');

  // Available classes based on selected program
  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : [];

  const availableSections = selectedClass
    ? mockSections.filter((s) => s.classId === selectedClass)
    : [];

  const handleSearchFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate && !toDate && !selectedProgram) {
      showToast('Please enter From date / To date or select a program to search.');
      return;
    }
    // Simulate filtered results
    setBlockedDates([
      {
        id: 'blk-1',
        slNo: 1,
        name: 'Gandhi Jayanti Holiday',
        program: 'All Programs',
        className: 'All Classes',
        section: 'All Sections',
        type: 'National Holiday',
        fromDate: '02/10/2026',
        toDate: '02/10/2026',
        reason: 'National Holiday - School closed',
      },
      {
        id: 'blk-2',
        slNo: 2,
        name: 'Mid-Term Exam Break',
        program: 'Secondary School',
        className: 'Grade 10',
        section: 'All Sections',
        type: 'Academic Event',
        fromDate: '14/10/2026',
        toDate: '16/10/2026',
        reason: 'Preparation Leave',
      },
    ]);
    showToast('Search results loaded.');
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalName('');
    setModalProgram('All Programs');
    setModalClass('All Classes');
    setModalSection('All Sections');
    setModalType('School Holiday');
    setModalFromDate('26/09/2026');
    setModalToDate('26/09/2026');
    setModalReason('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BlockedAttendanceDate) => {
    setEditingItem(item);
    setModalName(item.name);
    setModalProgram(item.program);
    setModalClass(item.className);
    setModalSection(item.section);
    setModalType(item.type);
    setModalFromDate(item.fromDate);
    setModalToDate(item.toDate);
    setModalReason(item.reason || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim() || !modalFromDate || !modalToDate) return;

    if (editingItem) {
      setBlockedDates((prev) =>
        prev.map((b) =>
          b.id === editingItem.id
            ? {
                ...b,
                name: modalName,
                program: modalProgram,
                className: modalClass,
                section: modalSection,
                type: modalType,
                fromDate: modalFromDate,
                toDate: modalToDate,
                reason: modalReason,
              }
            : b
        )
      );
      showToast(`Blocked date "${modalName}" updated successfully.`);
    } else {
      const newItem: BlockedAttendanceDate = {
        id: `blk-${Date.now()}`,
        slNo: blockedDates.length + 1,
        name: modalName,
        program: modalProgram,
        className: modalClass,
        section: modalSection,
        type: modalType,
        fromDate: modalFromDate,
        toDate: modalToDate,
        reason: modalReason,
      };
      setBlockedDates((prev) => [...prev, newItem]);
      showToast(`New blocked date rule "${modalName}" created.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setBlockedDates((prev) => prev.filter((b) => b.id !== deletingId));
    setDeletingId(null);
    showToast('Blocked date rule deleted successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtered by table search input
  const filteredData = blockedDates.filter((item) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.program.toLowerCase().includes(q) ||
      item.className.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.fromDate.includes(q) ||
      item.toDate.includes(q)
    );
  });

  const totalEntries = filteredData.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  return (
    <div className="blocked-attendance-container">
      {/* Toast Alert */}
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

      {/* Filter Form Bar matching screenshot */}
      <form onSubmit={handleSearchFilter} className="blocked-filter-form">
        <div className="blocked-filter-grid">
          {/* Program */}
          <div className="form-group blocked-filter-field">
            <label htmlFor="blk-program" className="form-label">
              Program
            </label>
            <div className="select-wrapper">
              <select
                id="blk-program"
                className="form-control form-select"
                value={selectedProgram}
                onChange={(e) => {
                  setSelectedProgram(e.target.value);
                  setSelectedClass('');
                  setSelectedSection('');
                }}
              >
                <option value="">Select Program</option>
                {mockPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-chevron-icon" size={16} />
            </div>
          </div>

          {/* Class */}
          <div className="form-group blocked-filter-field">
            <label htmlFor="blk-class" className="form-label">
              Class
            </label>
            <div className="select-wrapper">
              <select
                id="blk-class"
                className="form-control form-select"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
                disabled={!selectedProgram && availableClasses.length === 0}
              >
                <option value="">{selectedProgram ? 'Select Class' : ''}</option>
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-chevron-icon" size={16} />
            </div>
          </div>

          {/* Section */}
          <div className="form-group blocked-filter-field">
            <label htmlFor="blk-section" className="form-label">
              Section
            </label>
            <div className="select-wrapper">
              <select
                id="blk-section"
                className="form-control form-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass && availableSections.length === 0}
              >
                <option value="">Select Section</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-chevron-icon" size={16} />
            </div>
          </div>

          {/* From date * */}
          <div className="form-group blocked-filter-field">
            <label htmlFor="blk-from-date" className="form-label">
              From date <span className="required-star">*</span>
            </label>
            <input
              id="blk-from-date"
              type="text"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder=""
            />
          </div>

          {/* To date * */}
          <div className="form-group blocked-filter-field">
            <label htmlFor="blk-to-date" className="form-label">
              To date <span className="required-star">*</span>
            </label>
            <input
              id="blk-to-date"
              type="text"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder=""
            />
          </div>

          {/* Search Button */}
          <div className="form-group blocked-search-btn-field">
            <button type="submit" className="btn-blocked-search">
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Add Button Row - Aligned to Right */}
      <div className="blocked-add-row">
        <button
          type="button"
          className="btn-blocked-add"
          onClick={handleOpenAddModal}
        >
          Add
        </button>
      </div>

      {/* Top Controls Bar */}
      <div className="table-controls-bar table-controls-top" style={{ marginTop: '14px' }}>
        <div className="controls-left">
          <div className="page-size-selector">
            <span>Show</span>
            <div className="select-wrapper size-select-wrapper">
              <select
                className="form-control form-select size-select"
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

          <div className="entries-info-text">
            Showing {startIndex} to {endIndex} of {totalEntries} entries
          </div>
        </div>

        <div className="controls-right">
          <div className="pagination-bar">
            <button
              type="button"
              className="btn-page-nav disabled"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-page-nav disabled"
              disabled
            >
              Next
            </button>
          </div>

          <div className="table-search-box">
            <label htmlFor="blocked-search-top" className="search-label">
              Search:
            </label>
            <input
              id="blocked-search-top"
              type="text"
              className="form-control search-field-compact"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Blocked Attendance Data Table */}
      <div className="table-responsive-wrapper blocked-table-wrapper">
        <table className="blocked-data-table" aria-label="Blocked Attendance Dates">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>
                <div className="th-sortable active-sort">
                  <span>SL NO</span>
                  <ArrowUp size={12} className="sort-arrow" />
                </div>
              </th>
              <th style={{ width: '18%' }}>
                <div className="th-sortable">
                  <span>NAME</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '14%' }}>
                <div className="th-sortable">
                  <span>PROGRAM</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '10%' }}>
                <div className="th-sortable">
                  <span>CLASS</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '10%' }}>
                <div className="th-sortable">
                  <span>SECTION</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '12%' }}>
                <div className="th-sortable">
                  <span>TYPE</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '10%' }}>
                <div className="th-sortable">
                  <span>FROM DATE</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '10%' }}>
                <div className="th-sortable">
                  <span>TO DATE</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '8%', textAlign: 'right' }}>
                <div className="th-sortable th-right">
                  <span>ACTIONS</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-blocked-cell">
                  No data available in table
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="blocked-table-row">
                  <td className="cell-sino">{item.slNo}</td>
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.program}</td>
                  <td>{item.className}</td>
                  <td>{item.section}</td>
                  <td>
                    <span className="type-badge">{item.type}</span>
                  </td>
                  <td>{item.fromDate}</td>
                  <td>{item.toDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="blocked-action-icons">
                      <button
                        type="button"
                        className="btn-icon-action btn-edit-config"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit rule"
                      >
                        <SquarePen size={17} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action btn-delete-config"
                        onClick={() => setDeletingId(item.id)}
                        title="Delete rule"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Controls Bar */}
      <div className="table-controls-bar table-controls-bottom">
        <div className="controls-left">
          <div className="entries-info-text">
            Showing {startIndex} to {endIndex} of {totalEntries} entries
          </div>
        </div>

        <div className="controls-right">
          <div className="pagination-bar">
            <button
              type="button"
              className="btn-page-nav disabled"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-page-nav disabled"
              disabled
            >
              Next
            </button>
          </div>

          <div className="table-search-box">
            <label htmlFor="blocked-search-bottom" className="search-label">
              Search:
            </label>
            <input
              id="blocked-search-bottom"
              type="text"
              className="form-control search-field-compact"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Blocked Date Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-template-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? 'Edit Blocked Attendance Rule' : 'Add Blocked Attendance Rule'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="modal-blk-name" className="form-label">
                    Rule / Event Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="modal-blk-name"
                    type="text"
                    className="form-control"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                    placeholder="e.g. Annual Sports Meet / Holiday"
                  />
                </div>

                <div className="form-grid-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="modal-blk-from" className="form-label">
                      From Date <span className="required-star">*</span>
                    </label>
                    <input
                      id="modal-blk-from"
                      type="text"
                      className="form-control"
                      value={modalFromDate}
                      onChange={(e) => setModalFromDate(e.target.value)}
                      required
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-blk-to" className="form-label">
                      To Date <span className="required-star">*</span>
                    </label>
                    <input
                      id="modal-blk-to"
                      type="text"
                      className="form-control"
                      value={modalToDate}
                      onChange={(e) => setModalToDate(e.target.value)}
                      required
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>

                <div className="form-grid-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="modal-blk-type" className="form-label">
                      Block Type <span className="required-star">*</span>
                    </label>
                    <select
                      id="modal-blk-type"
                      className="form-control form-select"
                      value={modalType}
                      onChange={(e) => setModalType(e.target.value)}
                    >
                      <option value="School Holiday">School Holiday</option>
                      <option value="National Holiday">National Holiday</option>
                      <option value="Emergency Closure">Emergency Closure</option>
                      <option value="Academic Event">Academic Event</option>
                      <option value="Exam Preparation">Exam Preparation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-blk-prog" className="form-label">
                      Program Scope
                    </label>
                    <select
                      id="modal-blk-prog"
                      className="form-control form-select"
                      value={modalProgram}
                      onChange={(e) => setModalProgram(e.target.value)}
                    >
                      <option value="All Programs">All Programs</option>
                      {mockPrograms.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-blk-reason" className="form-label">
                    Reason / Explanation
                  </label>
                  <textarea
                    id="modal-blk-reason"
                    className="form-control modal-textarea"
                    rows={3}
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="Enter reason for blocking attendance marking on these dates..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  {editingItem ? 'Save Changes' : 'Create Block Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal-card modal-confirm-card">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deletion</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingId(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="confirm-warning-box">
                <AlertTriangle size={24} className="warning-icon" />
                <p>
                  Are you sure you want to delete this blocked attendance date rule? Teachers will be able to record attendance on this date.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
