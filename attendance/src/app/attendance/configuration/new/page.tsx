'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { AddAttendanceConfigurationForm } from '@/components/AddAttendanceConfigurationForm';

export default function AddAttendanceConfigurationPage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Add Attendance Configuration"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance Configuration', href: '/attendance/configuration' },
          { label: 'Add Attendance Configuration' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Add Configuration Form */}
        <AddAttendanceConfigurationForm />
      </div>
    </div>
  );
}
