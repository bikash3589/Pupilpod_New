'use client';

import React, { useState } from 'react';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { ViewDailyAttendanceForm } from '@/components/ViewDailyAttendanceForm';
import { DailyAttendanceOverviewTable } from '@/components/DailyAttendanceOverviewTable';
import { mockStaffList, mockDailyRollGroups } from '@/data/mockDailyAttendanceData';

export default function ViewDailyAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('staff-gopi');
  const [showResults, setShowResults] = useState<boolean>(false);

  const currentStaff = mockStaffList.find((s) => s.id === selectedStaffId) || mockStaffList[0];

  // Filter roll groups assigned to selected staff (or all if staff-all)
  const filteredRollGroups = selectedStaffId === 'staff-all'
    ? mockDailyRollGroups
    : mockDailyRollGroups.filter((rg) => rg.assignedStaff === currentStaff.name);

  const handleClearFilters = () => {
    setSelectedDate('25/09/2026');
    setSelectedStaffId('staff-gopi');
    setShowResults(false);
  };

  const handleGo = () => {
    setShowResults(true);
  };

  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <HeaderBreadcrumbs
        title="View Daily Attendance"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'View Daily Attendance' },
        ]}
      />

      {/* Main White Card matching screenshot */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Form: View Daily Attendance */}
        <ViewDailyAttendanceForm
          staffList={mockStaffList}
          selectedDate={selectedDate}
          selectedStaffId={selectedStaffId}
          onDateChange={setSelectedDate}
          onStaffChange={setSelectedStaffId}
          onClearFilters={handleClearFilters}
          onGo={handleGo}
        />

        {/* Results Region: Daily Attendance Overview Table when Go is clicked */}
        {showResults && (
          <div className="daily-results-region">
            <DailyAttendanceOverviewTable
              rows={filteredRollGroups.length > 0 ? filteredRollGroups : mockDailyRollGroups}
              selectedDate={selectedDate}
              staffName={currentStaff.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
