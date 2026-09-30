'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export const AddAttendanceConfigurationForm: React.FC = () => {
  const router = useRouter();

  // Initial state strictly matching the screenshot
  const [organisation, setOrganisation] = useState<string>('');
  const [classInput, setClassInput] = useState<string>('');
  const [attendanceType, setAttendanceType] = useState<string>('');

  const [selectLockAttendanceMarking, setSelectLockAttendanceMarking] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [autoLockAttendance, setAutoLockAttendance] = useState<boolean>(false);

  const [enableSmsForAbsence, setEnableSmsForAbsence] = useState<boolean>(false);
  const [selectedSmsTemplate, setSelectedSmsTemplate] = useState<string>('Absent SMS');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(['Father Mobile', 'Mother Mobile']);

  const [selectSubjectMandatory, setSelectSubjectMandatory] = useState<boolean>(false);
  const [displayField1, setDisplayField1] = useState<string>('');
  const [sortByField1, setSortByField1] = useState<boolean>(false);
  const [displayField2, setDisplayField2] = useState<string>('');
  const [sortByField2, setSortByField2] = useState<boolean>(false);
  const [defaultDisplayField, setDefaultDisplayField] = useState<string>('Student Name');

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessToast(true);
    setTimeout(() => {
      router.push('/attendance/configuration');
    }, 1500);
  };

  return (
    <div className="edit-attendance-config-container">
      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="save-toast-banner" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>New Attendance Configuration created successfully. Redirecting to list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-attendance-config-form">
        <div className="edit-config-grid">
          {/* 1. Organisation */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-org-select" className="edit-field-label">
                Organisation
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="add-org-select"
                  className="form-control form-select"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                >
                  <option value="">Select Organisation</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="IB">IB</option>
                  <option value="State Board">State Board</option>
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* 2. Class * */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-class-input" className="edit-field-label">
                Class <span className="required-star">*</span>
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="add-class-input"
                type="text"
                className="form-control"
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                placeholder=""
                required
              />
            </div>
          </div>

          {/* 3. Attendance Type * */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-att-type" className="edit-field-label">
                Attendance Type <span className="required-star">*</span>
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="add-att-type"
                  className="form-control form-select"
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                  required
                >
                  <option value="">Select Attendance Type</option>
                  <option value="Session">Session</option>
                  <option value="Subject">Subject</option>
                  <option value="Both">Both</option>
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* 4. Select Lock Attendance Marking */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Select Lock Attendance Marking</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Yes</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={selectLockAttendanceMarking}
                  onChange={(e) => setSelectLockAttendanceMarking(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* 5. From date */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-from-date" className="edit-field-label">
                From date
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="add-from-date"
                type="text"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          {/* 6. To date */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-to-date" className="edit-field-label">
                To date
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="add-to-date"
                type="text"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          {/* 7. Auto Lock Attendance */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Auto Lock Attendance</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Yes</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={autoLockAttendance}
                  onChange={(e) => setAutoLockAttendance(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* 8. Enable SMS for Absence ? */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Enable SMS for Absence ?</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Yes</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={enableSmsForAbsence}
                  onChange={(e) => setEnableSmsForAbsence(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Optional SMS Fields when checked */}
          {enableSmsForAbsence && (
            <>
              <div className="edit-form-row">
                <div className="edit-label-col">
                  <label htmlFor="add-sms-tmpl" className="edit-field-label">
                    Select SMS Template
                  </label>
                </div>
                <div className="edit-input-col">
                  <div className="select-wrapper">
                    <select
                      id="add-sms-tmpl"
                      className="form-control form-select"
                      value={selectedSmsTemplate}
                      onChange={(e) => setSelectedSmsTemplate(e.target.value)}
                    >
                      <option value="Absent SMS">Absent SMS</option>
                      <option value="Late Arrival SMS">Late Arrival SMS</option>
                      <option value="Emergency Alert">Emergency Alert</option>
                    </select>
                    <ChevronDown className="select-chevron-icon" size={16} />
                  </div>
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-label-col" style={{ alignSelf: 'flex-start', paddingTop: '6px' }}>
                  <label className="edit-field-label">Select the SMS recipients</label>
                </div>
                <div className="edit-input-col">
                  <div className="recipients-listbox" role="listbox" aria-multiselectable="true">
                    {['Student Mobile', 'Father Mobile', 'Mother Mobile', 'Others'].map((item) => {
                      const isSelected = selectedRecipients.includes(item);
                      return (
                        <div
                          key={item}
                          role="option"
                          aria-selected={isSelected}
                          className={`recipient-option-row ${isSelected ? 'selected' : ''}`}
                          onClick={() =>
                            setSelectedRecipients((prev) =>
                              prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
                            )
                          }
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 9. Select Subject Mandatory */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Select Subject Mandatory</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Yes</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={selectSubjectMandatory}
                  onChange={(e) => setSelectSubjectMandatory(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* 10. Display Field1 */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-disp-field1" className="edit-field-label">
                Display Field1
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="add-disp-field1"
                  className="form-control form-select"
                  value={displayField1}
                  onChange={(e) => setDisplayField1(e.target.value)}
                >
                  <option value="">Select Display Field</option>
                  <option value="Admission No">Admission No</option>
                  <option value="Roll No">Roll No</option>
                  <option value="Gender">Gender</option>
                  <option value="Father Name">Father Name</option>
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* 11. Sort by this field? (Field 1) */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Sort by this field?</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Sort by this field</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={sortByField1}
                  onChange={(e) => setSortByField1(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* 12. Display Field2 */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-disp-field2" className="edit-field-label">
                Display Field2
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="add-disp-field2"
                  className="form-control form-select"
                  value={displayField2}
                  onChange={(e) => setDisplayField2(e.target.value)}
                >
                  <option value="">Select Display Field</option>
                  <option value="Admission No">Admission No</option>
                  <option value="Roll No">Roll No</option>
                  <option value="Blood Group">Blood Group</option>
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* 13. Sort by this field? (Field 2) */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Sort by this field?</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Sort by this field</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={sortByField2}
                  onChange={(e) => setSortByField2(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* 14. Default Display Field */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="add-default-disp" className="edit-field-label">
                Default Display Field
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="add-default-disp"
                type="text"
                className="form-control"
                value={defaultDisplayField}
                onChange={(e) => setDefaultDisplayField(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer Submit */}
        <div className="edit-config-footer">
          <span className="required-notice-text">* denotes a required field</span>
          <button type="submit" className="btn-submit-config">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
