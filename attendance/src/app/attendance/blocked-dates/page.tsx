'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { BlockedAttendanceManager } from '@/components/BlockedAttendanceManager';

export default function BlockedAttendancePage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Blocked Attendance"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Blocked Attendance' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Blocked Attendance Manager */}
        <BlockedAttendanceManager />
      </div>
    </div>
  );
}
