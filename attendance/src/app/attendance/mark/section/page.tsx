'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeaderBreadcrumbs } from '@/components/HeaderBreadcrumbs';
import { AttendanceNav } from '@/components/AttendanceNav';
import { TakeAttendanceSectionForm } from '@/components/TakeAttendanceSectionForm';
import { StudentAttendanceTable } from '@/components/StudentAttendanceTable';
import {
  mockPrograms,
  mockClasses,
  mockSections,
  mockSessions,
  generateMockRoster,
} from '@/data/mockAttendanceData';
import { StudentAttendanceRow } from '@/types/attendance';
import {
  saveSectionAttendanceRecord,
  getSectionAttendanceRecord,
} from '@/lib/attendanceStorage';

function TakeAttendanceBySectionContent() {
  const searchParams = useSearchParams();

  // Filter state
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('25/09/2026');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Results & status state
  const [showResults, setShowResults] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roster, setRoster] = useState<StudentAttendanceRow[]>([]);

  // Parse query params if navigating from report / links
  useEffect(() => {
    const qProg = searchParams.get('program');
    const qClass = searchParams.get('class');
    const qSec = searchParams.get('section');
    const qDate = searchParams.get('date');
    const qSes = searchParams.get('session');

    if (qProg) setSelectedProgram(qProg);
    if (qClass) setSelectedClass(qClass);
    if (qSec) setSelectedSection(qSec);
    if (qDate) setSelectedDate(qDate);
    if (qSes) {
      setSelectedSession(qSes);
    } else {
      setSelectedSession(mockSessions[0].id);
    }

    if (qSec) {
      const existing = getSectionAttendanceRecord(qDate || '25/09/2026', qSec, qSes || mockSessions[0].id);
      setRoster(existing ? existing.rows : generateMockRoster(qSec));
      setShowResults(true);
    }
  }, [searchParams]);

  // Filtered classes based on selected program
  const availableClasses = selectedProgram
    ? mockClasses.filter((c) => c.programId === selectedProgram)
    : [];

  // Filtered sections based on selected class
  const availableSections = selectedClass
    ? mockSections.filter((s) => s.classId === selectedClass)
    : [];

  // Cascading changes
  const handleProgramChange = (progId: string) => {
    setSelectedProgram(progId);
    setSelectedClass('');
    setSelectedSection('');
    setSelectedSession('');
    setShowResults(false);
    setErrorMessage(null);
  };

  const handleClassChange = (clsId: string) => {
    setSelectedClass(clsId);
    setSelectedSection('');
    setShowResults(false);
    setErrorMessage(null);
  };

  const handleSectionChange = (secId: string) => {
    setSelectedSection(secId);
    setErrorMessage(null);
  };

  const handleDateChange = (val: string) => {
    setSelectedDate(val);
    setErrorMessage(null);
  };

  const handleSessionChange = (val: string) => {
    setSelectedSession(val);
    setErrorMessage(null);
  };

  const handleClearFilters = () => {
    setSelectedProgram('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedDate('25/09/2026');
    setSelectedSession('');
    setSearchQuery('');
    setShowResults(false);
    setErrorMessage(null);
  };

  const handleFillDemo = () => {
    const prog = mockPrograms.find((p) => p.code === 'CBSE') || mockPrograms[0];
    const cls = mockClasses.find((c) => c.programId === prog.id) || mockClasses[0];
    const sec = mockSections.find((s) => s.classId === cls.id) || mockSections[0];
    const ses = mockSessions[0];

    setSelectedProgram(prog.id);
    setSelectedClass(cls.id);
    setSelectedSection(sec.id);
    setSelectedSession(ses.id);
    setSelectedDate('25/09/2026');

    const existing = getSectionAttendanceRecord('25/09/2026', sec.id, ses.id);
    setRoster(existing ? existing.rows : generateMockRoster(sec.id));
    setShowResults(true);
    setErrorMessage(null);
  };

  const handleGo = () => {
    if (!selectedProgram || !selectedClass || !selectedSection || !selectedSession) {
      setErrorMessage(
        'Please select Program, Class, Section, and Session before clicking Go.'
      );
      return;
    }

    setErrorMessage(null);
    const existing = getSectionAttendanceRecord(selectedDate, selectedSection, selectedSession);
    setRoster(existing ? existing.rows : generateMockRoster(selectedSection));
    setShowResults(true);
  };

  const handleSaveAttendance = (
    savedRows: StudentAttendanceRow[],
    notifyParents: boolean
  ) => {
    setRoster(savedRows);
    const currentSessionObj = mockSessions.find((s) => s.id === selectedSession);
    // Persist to LocalStorage database
    saveSectionAttendanceRecord({
      date: selectedDate,
      programId: selectedProgram,
      classId: selectedClass,
      sectionId: selectedSection,
      sessionId: selectedSession,
      sessionName: currentSessionObj?.name || 'Session 1',
      rows: savedRows,
    });
  };

  const currentClassObj = mockClasses.find((c) => c.id === selectedClass);
  const currentSectionObj = mockSections.find((s) => s.id === selectedSection);
  const currentSessionObj = mockSessions.find((s) => s.id === selectedSession);

  return (
    <div className="attendance-page-layout">
      {/* Top Header & Breadcrumb */}
      <HeaderBreadcrumbs
        title="Take Attendance By Section"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Take Attendance By Section' },
        ]}
      />

      {/* Main White Card matching the image */}
      <div className="attendance-main-card">
        {/* Navigation Tabs Bar */}
        <AttendanceNav />

        {/* Filter Form */}
        <TakeAttendanceSectionForm
          programs={mockPrograms}
          classes={availableClasses}
          sections={availableSections}
          sessions={mockSessions}
          selectedProgram={selectedProgram}
          selectedClass={selectedClass}
          selectedSection={selectedSection}
          selectedDate={selectedDate}
          selectedSession={selectedSession}
          searchQuery={searchQuery}
          onProgramChange={handleProgramChange}
          onClassChange={handleClassChange}
          onSectionChange={handleSectionChange}
          onDateChange={handleDateChange}
          onSessionChange={handleSessionChange}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
          onGo={handleGo}
          onFillDemo={handleFillDemo}
        />

        {/* Error Validation Alert */}
        {errorMessage && (
          <div className="validation-error-alert" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Results Region: Student Attendance Grid */}
        {showResults && (
          <div className="attendance-results-region">
            <StudentAttendanceTable
              roster={roster}
              searchQuery={searchQuery}
              onSave={handleSaveAttendance}
              onReset={() => {
                const existing = getSectionAttendanceRecord(selectedDate, selectedSection, selectedSession);
                setRoster(existing ? existing.rows : generateMockRoster(selectedSection));
              }}
              sectionName={currentSectionObj?.name || ''}
              classNameStr={currentClassObj?.name || ''}
              dateStr={selectedDate}
              sessionName={currentSessionObj?.name || ''}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TakeAttendanceBySectionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading attendance...</div>}>
      <TakeAttendanceBySectionContent />
    </Suspense>
  );
}
