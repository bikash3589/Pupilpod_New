'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, X, XCircle, Plus, CheckCircle2 } from 'lucide-react';

interface SessionRow {
  sessionNo: number;
  sessionName: string;
}

export const EditAttendanceConfigurationForm: React.FC = () => {
  const router = useRouter();

  // Form states matching screenshot
  const [organisation, setOrganisation] = useState<string>('CBSE');
  const [classes, setClasses] = useState<string[]>(['Class 1', 'Class 2', 'Class 3']);
  const [newClassInput, setNewClassInput] = useState<string>('');
  const [isAddingClass, setIsAddingClass] = useState<boolean>(false);

  const [attendanceType, setAttendanceType] = useState<string>('Session');
  const [lockAttendanceMarking, setLockAttendanceMarking] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [autoLockAttendance, setAutoLockAttendance] = useState<boolean>(false);

  const [enableSmsForAbsence, setEnableSmsForAbsence] = useState<boolean>(true);
  const [selectedSmsTemplate, setSelectedSmsTemplate] = useState<string>('Absent SMS');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([
    'Father Mobile',
    'Mother Mobile',
  ]);

  const [selectSubjectMandatory, setSelectSubjectMandatory] = useState<boolean>(true);
  const [displayField1, setDisplayField1] = useState<string>('');
  const [sortByField1, setSortByField1] = useState<boolean>(false);
  const [displayField2, setDisplayField2] = useState<string>('');
  const [sortByField2, setSortByField2] = useState<boolean>(false);
  const [defaultDisplayField, setDefaultDisplayField] = useState<string>('Student Name');

  const [noOfSessions, setNoOfSessions] = useState<number>(1);
  const [sessions, setSessions] = useState<SessionRow[]>([
    { sessionNo: 1, sessionName: 'Session' },
  ]);

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Class tag handlers
  const handleRemoveClass = (clsToRemove: string) => {
    setClasses((prev) => prev.filter((c) => c !== clsToRemove));
  };

  const handleAddClass = () => {
    if (newClassInput.trim() && !classes.includes(newClassInput.trim())) {
      setClasses((prev) => [...prev, newClassInput.trim()]);
      setNewClassInput('');
      setIsAddingClass(false);
    }
  };

  // Recipient multi-select handler
  const handleToggleRecipient = (recipient: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipient)
        ? prev.filter((r) => r !== recipient)
        : [...prev, recipient]
    );
  };

  // Session table handlers
  const handleSessionNameChange = (index: number, newName: string) => {
    setSessions((prev) => {
      const copy = [...prev];
      copy[index].sessionName = newName;
      return copy;
    });
  };

  const handleRemoveSession = (index: number) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((s, idx) => ({ ...s, sessionNo: idx + 1 }));
    });
    setNoOfSessions((prev) => Math.max(1, prev - 1));
  };

  const handleNoOfSessionsChange = (val: number) => {
    const count = Math.max(1, Math.min(val, 10));
    setNoOfSessions(count);
    setSessions((prev) => {
      const newSessions: SessionRow[] = [];
      for (let i = 1; i <= count; i++) {
        if (prev[i - 1]) {
          newSessions.push(prev[i - 1]);
        } else {
          newSessions.push({
            sessionNo: i,
            sessionName: `Session ${i}`,
          });
        }
      }
      return newSessions;
    });
  };

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
          <span>Attendance configuration updated successfully. Redirecting to list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-attendance-config-form">
        <div className="edit-config-grid">
          {/* 1. Organisation */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-org-select" className="edit-field-label">
                Organisation <span className="required-star">*</span>
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="edit-org-select"
                  className="form-control form-select"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="IB">IB</option>
                  <option value="State Board">State Board</option>
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* 2. Class Tag Input */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Class</label>
            </div>
            <div className="edit-input-col">
              <div className="class-tags-box">
                {classes.map((cls) => (
                  <span key={cls} className="class-tag-pill">
                    <span className="class-tag-text">{cls}</span>
                    <button
                      type="button"
                      className="class-tag-remove"
                      onClick={() => handleRemoveClass(cls)}
                      title={`Remove ${cls}`}
                      aria-label={`Remove ${cls}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isAddingClass ? (
                  <div className="add-class-inline">
                    <input
                      type="text"
                      className="inline-class-input"
                      value={newClassInput}
                      onChange={(e) => setNewClassInput(e.target.value)}
                      placeholder="e.g. Class 4"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddClass();
                        } else if (e.key === 'Escape') {
                          setIsAddingClass(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-add-tag-confirm"
                      onClick={handleAddClass}
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-add-tag-trigger"
                    onClick={() => setIsAddingClass(true)}
                  >
                    + Add Class
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Attendance Type */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-att-type" className="edit-field-label">
                Attendance Type <span className="required-star">*</span>
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="edit-att-type"
                  className="form-control form-select"
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                >
                  <option value="Session">Session</option>
                  <option value="Subject">Subject</option>
                  <option value="Both">Both</option>
                </select>
                <ChevronDown className="select-chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* 4. Lock Attendance Marking */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label className="edit-field-label">Lock Attendance Marking</label>
            </div>
            <div className="edit-input-col">
              <label className="checkbox-label-inline">
                <span>Yes</span>
                <input
                  type="checkbox"
                  className="edit-checkbox"
                  checked={lockAttendanceMarking}
                  onChange={(e) => setLockAttendanceMarking(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* 5. From date */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-from-date" className="edit-field-label">
                From date
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="edit-from-date"
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
              <label htmlFor="edit-to-date" className="edit-field-label">
                To date
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="edit-to-date"
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

          {/* 9. Select SMS Template */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-sms-tmpl" className="edit-field-label">
                Select SMS Template
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="edit-sms-tmpl"
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

          {/* 10. Select the SMS recipients */}
          <div className="edit-form-row">
            <div className="edit-label-col" style={{ alignSelf: 'flex-start', paddingTop: '6px' }}>
              <label className="edit-field-label">Select the SMS recipients</label>
            </div>
            <div className="edit-input-col">
              <div className="recipients-listbox" role="listbox" aria-multiselectable="true">
                {[
                  'Student Mobile',
                  'Father Mobile',
                  'Mother Mobile',
                  'Others',
                ].map((item) => {
                  const isSelected = selectedRecipients.includes(item);
                  return (
                    <div
                      key={item}
                      role="option"
                      aria-selected={isSelected}
                      className={`recipient-option-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleRecipient(item)}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 11. Select Subject Mandatory */}
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

          {/* 12. Display Field1 */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-disp-field1" className="edit-field-label">
                Display Field1
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="edit-disp-field1"
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

          {/* 13. Sort by this field? (Field 1) */}
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

          {/* 14. Display Field2 */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-disp-field2" className="edit-field-label">
                Display Field2
              </label>
            </div>
            <div className="edit-input-col">
              <div className="select-wrapper">
                <select
                  id="edit-disp-field2"
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

          {/* 15. Sort by this field? (Field 2) */}
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

          {/* 16. Default Display Field */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-default-disp" className="edit-field-label">
                Default Display Field
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="edit-default-disp"
                type="text"
                className="form-control"
                value={defaultDisplayField}
                onChange={(e) => setDefaultDisplayField(e.target.value)}
              />
            </div>
          </div>

          {/* 17. No of Sessions */}
          <div className="edit-form-row">
            <div className="edit-label-col">
              <label htmlFor="edit-no-sessions" className="edit-field-label">
                No of Sessions
              </label>
            </div>
            <div className="edit-input-col">
              <input
                id="edit-no-sessions"
                type="number"
                min={1}
                max={10}
                className="form-control"
                value={noOfSessions}
                onChange={(e) => handleNoOfSessionsChange(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 18. Sessions Table */}
          <div className="edit-form-row">
            <div className="edit-label-col" />
            <div className="edit-input-col">
              <div className="sessions-table-wrapper">
                <table className="sessions-config-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Session No</th>
                      <th>Session Name</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((ses, idx) => (
                      <tr key={ses.sessionNo}>
                        <td className="session-no-cell">{ses.sessionNo}</td>
                        <td className="session-name-cell">
                          <input
                            type="text"
                            className="form-control session-name-input"
                            value={ses.sessionName}
                            onChange={(e) => handleSessionNameChange(idx, e.target.value)}
                          />
                        </td>
                        <td className="session-remove-cell" style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-remove-session-circle"
                            onClick={() => handleRemoveSession(idx)}
                            title="Remove session"
                            aria-label={`Remove session ${ses.sessionNo}`}
                            disabled={sessions.length <= 1}
                          >
                            <XCircle size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
