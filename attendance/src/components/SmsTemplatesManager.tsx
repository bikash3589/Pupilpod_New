'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SmsTemplate } from '../types/attendance';
import { initialSmsTemplates, availableEntities } from '../data/mockSmsTemplateData';
import {
  SquarePen,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SmsTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<SmsTemplate[]>(initialSmsTemplates);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form input states
  const [nameInput, setNameInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<'Active' | 'Inactive'>('Active');
  const [selectedEntities, setSelectedEntities] = useState<string[]>(['Student_name', 'Attendance_date']);
  const [messageBodyInput, setMessageBodyInput] = useState<string>('');
  const [createdByInput, setCreatedByInput] = useState<string>('Anand Pupilpod');

  // Filter templates based on search
  const filteredTemplates = templates.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.templateName.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      t.createdBy.toLowerCase().includes(q) ||
      t.entities.join(' ').toLowerCase().includes(q)
    );
  });

  const totalEntries = filteredTemplates.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setNameInput('');
    setStatusInput('Active');
    setSelectedEntities(['Student_name', 'Attendance_date']);
    setMessageBodyInput('Dear Parent, your ward {Student_name} was marked ABSENT on {Attendance_date}. Please contact the school office.');
    setCreatedByInput('Anand Pupilpod');
    setIsModalOpen(true);
  };

  const openEditModal = (tmpl: SmsTemplate) => {
    setEditingTemplate(tmpl);
    setNameInput(tmpl.templateName);
    setStatusInput(tmpl.status);
    setSelectedEntities([...tmpl.entities]);
    setMessageBodyInput(tmpl.messageBody || '');
    setCreatedByInput(tmpl.createdBy);
    setIsModalOpen(true);
  };

  const handleToggleEntity = (entity: string) => {
    setSelectedEntities((prev) =>
      prev.includes(entity) ? prev.filter((e) => e !== entity) : [...prev, entity]
    );
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                templateName: nameInput,
                status: statusInput,
                entities: selectedEntities,
                messageBody: messageBodyInput,
                createdBy: createdByInput,
              }
            : t
        )
      );
      showToast(`Template "${nameInput}" updated successfully.`);
    } else {
      const newTmpl: SmsTemplate = {
        id: `tmpl-${Date.now()}`,
        siNo: templates.length + 1,
        templateName: nameInput,
        status: statusInput,
        createdBy: createdByInput,
        entities: selectedEntities,
        messageBody: messageBodyInput,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTemplates((prev) => [...prev, newTmpl]);
      showToast(`New template "${nameInput}" added successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setTemplates((prev) => prev.filter((t) => t.id !== deletingId));
    setDeletingId(null);
    showToast('SMS template deleted successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="sms-templates-container">
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

      {/* Top Header Row: Title & Add Button */}
      <div className="sms-templates-top-header">
        <h2 className="sms-templates-title">Sms Templates</h2>
        <Link
          href="/attendance/templates/new"
          className="btn-sms-add"
        >
          Add
        </Link>
      </div>

      {/* Controls Bar Above Table */}
      <div className="table-controls-bar table-controls-top">
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
            <span className="page-number-box active">1</span>
            <button
              type="button"
              className="btn-page-nav disabled"
              disabled
            >
              Next
            </button>
          </div>

          <div className="table-search-box">
            <label htmlFor="search-input-top" className="search-label">
              Search:
            </label>
            <input
              id="search-input-top"
              type="text"
              className="form-control search-field-compact"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SMS Templates Data Table */}
      <div className="table-responsive-wrapper sms-table-wrapper">
        <table className="sms-data-table" aria-label="SMS Templates">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>
                <div className="th-sortable active-sort">
                  <span>SI NO</span>
                  <ArrowUp size={12} className="sort-arrow" />
                </div>
              </th>
              <th style={{ width: '24%' }}>
                <div className="th-sortable">
                  <span>TEMPLATE NAME</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '14%' }}>
                <div className="th-sortable">
                  <span>STATUS</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '18%' }}>
                <div className="th-sortable">
                  <span>CREATED BY</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
              <th style={{ width: '24%' }}>
                <div className="th-header-cell">
                  <span>ENTITIES</span>
                </div>
              </th>
              <th style={{ width: '12%', textAlign: 'right' }}>
                <div className="th-sortable th-right">
                  <span>ACTIONS</span>
                  <ArrowUpDown size={12} className="sort-arrow-muted" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTemplates.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-config-cell">
                  No templates found matching &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              paginatedTemplates.map((t) => (
                <tr key={t.id} className="sms-table-row">
                  <td className="cell-sino">{t.siNo}</td>
                  <td className="cell-template-name">{t.templateName}</td>
                  <td className="cell-status">
                    <span className="status-text-regular">{t.status}</span>
                  </td>
                  <td className="cell-createdby">{t.createdBy}</td>
                  <td className="cell-entities">{t.entities.join(', ')}</td>
                  <td className="cell-actions" style={{ textAlign: 'right' }}>
                    <div className="sms-action-icons">
                      <Link
                        href="/attendance/templates/edit"
                        className="btn-icon-action btn-edit-config"
                        title="Edit Template"
                        aria-label={`Edit ${t.templateName}`}
                      >
                        <SquarePen size={18} />
                      </Link>
                      <button
                        type="button"
                        className="btn-icon-action btn-delete-config"
                        onClick={() => setDeletingId(t.id)}
                        title="Delete Template"
                        aria-label={`Delete ${t.templateName}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controls Bar Below Table */}
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
            <span className="page-number-box active">1</span>
            <button
              type="button"
              className="btn-page-nav disabled"
              disabled
            >
              Next
            </button>
          </div>

          <div className="table-search-box">
            <label htmlFor="search-input-bottom" className="search-label">
              Search:
            </label>
            <input
              id="search-input-bottom"
              type="text"
              className="form-control search-field-compact"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-template-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTemplate ? 'Edit SMS Template' : 'Add SMS Template'}
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
                {/* Template Name */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="modal-tmpl-name" className="form-label">
                    Template Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="modal-tmpl-name"
                    type="text"
                    className="form-control"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="e.g. Absent SMS"
                  />
                </div>

                {/* Status & Created By */}
                <div className="form-grid-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="modal-tmpl-status" className="form-label">
                      Status <span className="required-star">*</span>
                    </label>
                    <select
                      id="modal-tmpl-status"
                      className="form-control form-select"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value as any)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-tmpl-creator" className="form-label">
                      Created By <span className="required-star">*</span>
                    </label>
                    <input
                      id="modal-tmpl-creator"
                      type="text"
                      className="form-control"
                      value={createdByInput}
                      onChange={(e) => setCreatedByInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Entities selection */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">
                    Available Entities (Click to toggle)
                  </label>
                  <div className="entities-pill-group">
                    {availableEntities.map((ent) => {
                      const isSelected = selectedEntities.includes(ent);
                      return (
                        <button
                          key={ent}
                          type="button"
                          className={`btn-entity-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleEntity(ent)}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {ent}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Body */}
                <div className="form-group">
                  <label htmlFor="modal-tmpl-body" className="form-label">
                    Template Message Body
                  </label>
                  <textarea
                    id="modal-tmpl-body"
                    className="form-control modal-textarea"
                    rows={4}
                    value={messageBodyInput}
                    onChange={(e) => setMessageBodyInput(e.target.value)}
                    placeholder="Type template message here..."
                  />
                  <span className="field-hint text-muted">
                    {messageBodyInput.length} characters (approx. {Math.ceil((messageBodyInput.length || 1) / 160)} SMS segment)
                  </span>
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
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
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
                  Are you sure you want to delete this SMS template? Active notification services relying on it may fail.
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
