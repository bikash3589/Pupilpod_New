'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { StaffMember } from '../types/attendance';

interface ViewDailyAttendanceFormProps {
  staffList: StaffMember[];
  selectedDate: string;
  selectedStaffId: string;
  onDateChange: (val: string) => void;
  onStaffChange: (val: string) => void;
  onClearFilters: () => void;
  onGo: () => void;
}

export const ViewDailyAttendanceForm: React.FC<ViewDailyAttendanceFormProps> = ({
  staffList,
  selectedDate,
  selectedStaffId,
  onDateChange,
  onStaffChange,
  onClearFilters,
  onGo,
}) => {
  const currentStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGo();
  };

  return (
    <div className="view-daily-form-container">
      <h2 className="view-daily-subheading">View Daily Attendance</h2>

      <form className="view-daily-form" onSubmit={handleSubmit}>
        <div className="daily-form-grid">
          {/* Left Column: Labels */}
          <div className="daily-form-labels-col">
            <div className="label-block date-label-block">
              <label htmlFor="daily-date-input" className="form-label daily-form-label">
                Date <span className="required-star">*</span>
              </label>
              <span className="format-hint">Format: dd/mm/yyyy</span>
            </div>

            <div className="label-block staff-label-block">
              <label htmlFor="daily-staff-select" className="form-label daily-form-label">
                Staff <span className="required-star">*</span>
              </label>
            </div>

            <div className="required-notice-block">
              <span className="required-notice-text">* denotes a required field</span>
            </div>
          </div>

          {/* Right Column: Inputs & Actions */}
          <div className="daily-form-inputs-col">
            {/* Date Input */}
            <div className="daily-input-row date-input-row">
              <input
                id="daily-date-input"
                type="text"
                className="form-control form-input daily-date-field"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                placeholder="25/09/2026"
              />
            </div>

            {/* Staff Row with Avatar + Dropdown */}
            <div className="daily-input-row staff-input-row">
              <div
                className="staff-avatar-circle"
                style={{ backgroundColor: currentStaff?.avatarColor || '#94a3b8' }}
                aria-hidden="true"
              />
              <div className="select-wrapper staff-select-wrapper">
                <select
                  id="daily-staff-select"
                  className="form-control form-select daily-staff-field"
                  value={selectedStaffId}
                  onChange={(e) => onStaffChange(e.target.value)}
                >
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>

            {/* Actions: Clear Filters & Go */}
            <div className="daily-form-actions-row">
              <button
                type="button"
                className="btn-clear-filters"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>

              <button type="submit" className="btn-go">
                Go
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
