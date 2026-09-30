'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface EntityOption {
  key: string;
  label: string;
  token: string;
}

const entityOptions: EntityOption[] = [
  { key: 'student_name', label: 'Student Name', token: '@Student_name' },
  { key: 'student_info', label: 'Student Info', token: '@Student_info' },
  { key: 'admission_no', label: 'Admission/Student ID No', token: '@Admission_no' },
  { key: 'father_name', label: 'Father Name', token: '@Father_name' },
  { key: 'mother_name', label: 'Mother Name', token: '@Mother_name' },
  { key: 'class', label: 'Class', token: '@Class' },
  { key: 'section_name', label: 'Section Name', token: '@Section_name' },
  { key: 'attendance_date', label: 'Attendance Date', token: '@Attendance_date' },
  { key: 'session_name', label: 'Session Name', token: '@Session_name' },
  { key: 'subject_name', label: 'Subject Name', token: '@Subject_name' },
  { key: 'absent_reason', label: 'Absent Reason', token: '@Absent_reason' },
];

export const EditSmsTemplateForm: React.FC = () => {
  const router = useRouter();

  // Form states matching screenshot
  const [templateName, setTemplateName] = useState<string>('Absent SMS');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([
    'student_name',
    'attendance_date',
  ]);
  const [description, setDescription] = useState<string>(
    'Dear Parent, Your ward @Student_name is absent for @Attendance_date.'
  );
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleToggleEntity = (entity: EntityOption) => {
    if (selectedEntities.includes(entity.key)) {
      setSelectedEntities((prev) => prev.filter((k) => k !== entity.key));
    } else {
      setSelectedEntities((prev) => [...prev, entity.key]);
      // If token not in description, append it
      if (!description.includes(entity.token)) {
        setDescription((prev) => `${prev} ${entity.token}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      router.push('/attendance/templates');
    }, 1500);
  };

  return (
    <div className="edit-sms-template-container">
      {/* Toast Alert */}
      {showToast && (
        <div className="save-toast-banner" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>SMS Template updated successfully. Redirecting to template list...</span>
        </div>
      )}

      <h2 className="edit-sms-subheading">Edit Sms Template</h2>

      <form onSubmit={handleSubmit} className="edit-sms-template-form">
        {/* Row 1: Template Name (Left) & Template Status (Right) */}
        <div className="edit-sms-row-top">
          {/* Template Name */}
          <div className="form-group edit-sms-name-group">
            <label htmlFor="edit-sms-name" className="form-label edit-sms-label">
              Template Name <span className="required-star">*</span>
            </label>
            <input
              id="edit-sms-name"
              type="text"
              className="form-control edit-sms-name-input"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
            />
          </div>

          {/* Template Status */}
          <div className="form-group edit-sms-status-group">
            <span className="form-label edit-sms-label">Template Status</span>
            <label className="sms-status-checkbox-label">
              <span>Active</span>
              <input
                type="checkbox"
                className="edit-checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Row 2: Entities */}
        <div className="form-group edit-sms-entities-group">
          <label className="form-label edit-sms-label">
            Entities <span className="required-star">*</span>
          </label>
          <div className="entities-checkboxes-grid">
            {entityOptions.map((item) => {
              const isChecked = selectedEntities.includes(item.key);
              return (
                <label key={item.key} className="entity-checkbox-item">
                  <span className="entity-item-label">{item.label}</span>
                  <input
                    type="checkbox"
                    className="edit-checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleEntity(item)}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Row 3: Description */}
        <div className="form-group edit-sms-desc-group">
          <label htmlFor="edit-sms-desc" className="form-label edit-sms-label">
            Description <span className="required-star">*</span>
          </label>
          <textarea
            id="edit-sms-desc"
            className="form-control edit-sms-textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Footer: Required Notice & Submit Button */}
        <div className="edit-sms-footer">
          <span className="required-notice-text">* denotes a required field</span>
          <div className="edit-sms-submit-wrapper">
            <button type="submit" className="btn-sms-submit">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
