'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { EditSmsTemplateForm } from '@/components/EditSmsTemplateForm';

export default function EditSmsTemplatePage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Edit Sms Template"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Manage Sms Template', href: '/attendance/templates' },
          { label: 'Edit Sms Template' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Edit SMS Template Form */}
        <EditSmsTemplateForm />
      </div>
    </div>
  );
}
