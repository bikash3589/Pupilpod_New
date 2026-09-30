'use client';

import React from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { SmsTemplatesManager } from '@/components/SmsTemplatesManager';

export default function SmsTemplatesPage() {
  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="Sms Templates"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Sms Templates' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* SMS Templates Manager Component */}
        <SmsTemplatesManager />
      </div>
    </div>
  );
}
