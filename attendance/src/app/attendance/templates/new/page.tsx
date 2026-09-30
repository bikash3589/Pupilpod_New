'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { AddSmsTemplateForm } from '@/components/AddSmsTemplateForm';

export default function AddSmsTemplatePage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Add Sms Template"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Manage Sms Template', href: '/attendance/templates' },
          { label: 'Add Sms Template' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Add SMS Template Form */}
        <AddSmsTemplateForm />
      </div>
    </div>
  );
}
