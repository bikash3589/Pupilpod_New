'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { AttendanceConfigurationList } from '@/components/AttendanceConfigurationList';

export default function AttendanceConfigurationPage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Attendance Configuration"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Attendance Configuration' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Configuration List and Add/Edit Controls */}
        <AttendanceConfigurationList />
      </div>
    </div>
  );
}
