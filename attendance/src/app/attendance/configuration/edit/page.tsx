'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { EditAttendanceConfigurationForm } from '@/components/EditAttendanceConfigurationForm';

export default function EditAttendanceConfigurationPage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Edit Attendance Configuration"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance Configuration', href: '/attendance/configuration' },
          { label: 'Edit Attendance Configuration' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Edit Configuration Form */}
        <EditAttendanceConfigurationForm />
      </div>
    </div>
  );
}
