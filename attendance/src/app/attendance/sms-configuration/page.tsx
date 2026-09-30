'use client';

import React, { useState } from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { CheckCircle2, Save } from 'lucide-react';

export default function SmsConfigurationPage() {
  const [enableSms, setEnableSms] = useState(true);
  const [provider, setProvider] = useState('Twilio SMS Gateway');
  const [senderId, setSenderId] = useState('SCHATT');
  const [notifyOnAbsent, setNotifyOnAbsent] = useState(true);
  const [notifyOnLate, setNotifyOnLate] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="attendance-page-layout">
      <HeaderBreadcrumbs
        title="SMS Configuration"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'SMS Configuration' },
        ]}
      />

      <div className="attendance-main-card">
        <AttendanceNav />

        {showToast && (
          <div className="save-toast-banner" role="status" aria-live="polite">
            <CheckCircle2 size={18} className="toast-icon" />
            <span>SMS Configuration saved successfully.</span>
          </div>
        )}

        <div className="view-daily-form-container">
          <h2 className="view-daily-subheading">SMS Configuration</h2>

          <form onSubmit={handleSave} style={{ maxWidth: '640px' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={enableSms}
                  onChange={(e) => setEnableSms(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Enable Automated Attendance SMS
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="sms-provider" className="form-label">
                SMS Provider / Gateway <span className="required-star">*</span>
              </label>
              <select
                id="sms-provider"
                className="form-control form-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="Twilio SMS Gateway">Twilio SMS Gateway</option>
                <option value="AWS SNS Gateway">AWS SNS Gateway</option>
                <option value="MSG91 India">MSG91 India</option>
                <option value="Custom HTTP Webhook">Custom HTTP Webhook</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="sms-sender-id" className="form-label">
                Sender ID / Header <span className="required-star">*</span>
              </label>
              <input
                id="sms-sender-id"
                type="text"
                className="form-control"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Notification Triggers</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <input
                    type="checkbox"
                    checked={notifyOnAbsent}
                    onChange={(e) => setNotifyOnAbsent(e.target.checked)}
                  />
                  Send SMS when student is marked Absent
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <input
                    type="checkbox"
                    checked={notifyOnLate}
                    onChange={(e) => setNotifyOnLate(e.target.checked)}
                  />
                  Send SMS when student is marked Late
                </label>
              </div>
            </div>

            <button type="submit" className="btn-toolbar-primary" style={{ padding: '8px 24px' }}>
              <Save size={15} />
              <span>Save Configuration</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
