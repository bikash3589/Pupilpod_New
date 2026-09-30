'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AttendanceConfiguration } from '../types/attendance';
import { initialConfigurations } from '../data/mockConfigurationData';
import { SquarePen, Trash2, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const AttendanceConfigurationList: React.FC = () => {
  const [configurations, setConfigurations] = useState<AttendanceConfiguration[]>(initialConfigurations);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingConfig, setEditingConfig] = useState<AttendanceConfiguration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [orgInput, setOrgInput] = useState<string>('CBSE');
  const [classesInput, setClassesInput] = useState<string>('Class 1 Class 2 Class 3');
  const [attendanceTypeInput, setAttendanceTypeInput] = useState<'Session' | 'Subject' | 'Both'>('Session');
  const [academicYearInput, setAcademicYearInput] = useState<string>('2026-2027');

  const openCreateModal = () => {
    setEditingConfig(null);
    setOrgInput('CBSE');
    setClassesInput('Class 4 Class 5 Class 6');
    setAttendanceTypeInput('Session');
    setAcademicYearInput('2026-2027');
    setIsModalOpen(true);
  };

  const openEditModal = (config: AttendanceConfiguration) => {
    setEditingConfig(config);
    setOrgInput(config.organisation);
    setClassesInput(config.classes.join(' '));
    setAttendanceTypeInput(config.attendanceType);
    setAcademicYearInput(config.academicYear || '2026-2027');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const classList = classesInput.split(' ').filter(Boolean);

    if (editingConfig) {
      setConfigurations((prev) =>
        prev.map((c) =>
          c.id === editingConfig.id
            ? {
                ...c,
                organisation: orgInput,
                classes: classList,
                attendanceType: attendanceTypeInput,
                academicYear: academicYearInput,
              }
            : c
        )
      );
      showToast(`Configuration for ${orgInput} updated successfully.`);
    } else {
      const newConfig: AttendanceConfiguration = {
        id: `cfg-${Date.now()}`,
        organisation: orgInput,
        academicYear: academicYearInput,
        classes: classList,
        attendanceType: attendanceTypeInput,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setConfigurations((prev) => [...prev, newConfig]);
      showToast(`New configuration for ${orgInput} added successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setConfigurations((prev) => prev.filter((c) => c.id !== deletingId));
    setDeletingId(null);
    showToast('Attendance configuration deleted successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="attendance-config-container">
      {/* Toast Notification */}
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

      {/* Add Button */}
      <div className="config-header-actions">
        <Link
          href="/attendance/configuration/new"
          className="btn-config-add"
        >
          Add
        </Link>
      </div>

      {/* Table Divider */}
      <div className="config-table-divider" />

      {/* Table */}
      <div className="config-table-wrapper">
        <table className="config-data-table" aria-label="Attendance Configurations">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>ORGANISATION</th>
              <th style={{ width: '35%' }}>CLASSES</th>
              <th style={{ width: '25%' }}>ATTENDANCE TYPE</th>
              <th style={{ width: '15%', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {configurations.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-config-cell">
                  No attendance configurations found. Click &quot;Add&quot; to create one.
                </td>
              </tr>
            ) : (
              configurations.map((item) => (
                <tr key={item.id} className="config-table-row">
                  <td className="cell-org">{item.organisation}</td>
                  <td className="cell-classes">{item.classes.join(' ')}</td>
                  <td className="cell-type">{item.attendanceType}</td>
                  <td className="cell-action" style={{ textAlign: 'right' }}>
                    <div className="config-action-icons">
                      <Link
                        href="/attendance/configuration/edit"
                        className="btn-icon-action btn-edit-config"
                        title="Edit Configuration"
                        aria-label={`Edit ${item.organisation}`}
                      >
                        <SquarePen size={18} />
                      </Link>
                      <button
                        type="button"
                        className="btn-icon-action btn-delete-config"
                        onClick={() => setDeletingId(item.id)}
                        title="Delete Configuration"
                        aria-label={`Delete ${item.organisation}`}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingConfig ? 'Edit Attendance Configuration' : 'Add Attendance Configuration'}
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
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="modal-org-input" className="form-label">
                    Organisation <span className="required-star">*</span>
                  </label>
                  <input
                    id="modal-org-input"
                    type="text"
                    className="form-control"
                    value={orgInput}
                    onChange={(e) => setOrgInput(e.target.value)}
                    required
                    placeholder="e.g. CBSE, ICSE, IB"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="modal-classes-input" className="form-label">
                    Classes (space separated) <span className="required-star">*</span>
                  </label>
                  <input
                    id="modal-classes-input"
                    type="text"
                    className="form-control"
                    value={classesInput}
                    onChange={(e) => setClassesInput(e.target.value)}
                    required
                    placeholder="e.g. Class 1 Class 2 Class 3"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="modal-type-select" className="form-label">
                    Attendance Type <span className="required-star">*</span>
                  </label>
                  <select
                    id="modal-type-select"
                    className="form-control form-select"
                    value={attendanceTypeInput}
                    onChange={(e) => setAttendanceTypeInput(e.target.value as any)}
                  >
                    <option value="Session">Session</option>
                    <option value="Subject">Subject</option>
                    <option value="Both">Both (Session & Subject)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-ay-input" className="form-label">
                    Academic Year <span className="required-star">*</span>
                  </label>
                  <input
                    id="modal-ay-input"
                    type="text"
                    className="form-control"
                    value={academicYearInput}
                    onChange={(e) => setAcademicYearInput(e.target.value)}
                    placeholder="2026-2027"
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
                  {editingConfig ? 'Save Changes' : 'Create Configuration'}
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
                  Are you sure you want to delete this configuration? This action cannot be undone.
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
