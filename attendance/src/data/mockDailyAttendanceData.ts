import { StaffMember, DailyRollGroupRow, HistoryDayCell } from '../types/attendance';

export const mockStaffList: StaffMember[] = [
  { id: 'staff-gopi', name: 'Gopi', role: 'Class Teacher & Incharge', email: 'gopi@school.edu', avatarColor: '#94a3b8' },
  { id: 'staff-anita', name: 'Anita Sharma', role: 'Senior Secondary Coordinator', email: 'anita.s@school.edu', avatarColor: '#38bdf8' },
  { id: 'staff-rahul', name: 'Rahul Varma', role: 'Middle School Faculty', email: 'rahul.v@school.edu', avatarColor: '#a78bfa' },
  { id: 'staff-priya', name: 'Priya Sundaram', role: 'Science Department Head', email: 'priya.s@school.edu', avatarColor: '#fb7185' },
  { id: 'staff-all', name: 'All Staff (Consolidated)', role: 'Administrator View', email: 'admin@school.edu', avatarColor: '#64748b' },
];

const generateTenDayHistory = (pattern: ('TAKEN' | 'NOT_TAKEN' | 'HOLIDAY' | 'WEEKEND')[]): HistoryDayCell[] => {
  const dates = [
    { date: '11/09', dayName: 'Thu' },
    { date: '12/09', dayName: 'Fri' },
    { date: '15/09', dayName: 'Mon' },
    { date: '16/09', dayName: 'Tue' },
    { date: '17/09', dayName: 'Wed' },
    { date: '18/09', dayName: 'Thu' },
    { date: '19/09', dayName: 'Fri' },
    { date: '22/09', dayName: 'Mon' },
    { date: '23/09', dayName: 'Tue' },
    { date: '24/09', dayName: 'Wed' },
  ];

  return dates.map((d, index) => ({
    date: d.date,
    dayName: d.dayName,
    status: pattern[index] || 'TAKEN',
    takenCount: pattern[index] === 'TAKEN' ? 26 : 0,
    totalStudents: 28,
  }));
};

export const mockDailyRollGroups: DailyRollGroupRow[] = [
  {
    id: 'rg-1',
    programName: 'Secondary School',
    className: 'Grade 10',
    sectionName: 'Section A',
    sessionName: 'Session 1 (Morning)',
    assignedStaff: 'Gopi',
    todayStatus: 'TAKEN',
    recordedBy: 'Gopi',
    recordedAt: '08:45 AM',
    totalStudents: 28,
    presentCount: 25,
    absentCount: 3,
    tenDayHistory: generateTenDayHistory([
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
    ]),
  },
  {
    id: 'rg-2',
    programName: 'Secondary School',
    className: 'Grade 10',
    sectionName: 'Section A',
    sessionName: 'Session 2 (Afternoon)',
    assignedStaff: 'Gopi',
    todayStatus: 'NOT_TAKEN',
    totalStudents: 28,
    presentCount: 0,
    absentCount: 0,
    tenDayHistory: generateTenDayHistory([
      'TAKEN', 'TAKEN', 'TAKEN', 'NOT_TAKEN', 'TAKEN',
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
    ]),
  },
  {
    id: 'rg-3',
    programName: 'Secondary School',
    className: 'Grade 9',
    sectionName: 'Section B',
    sessionName: 'Session 1 (Morning)',
    assignedStaff: 'Gopi',
    todayStatus: 'TAKEN',
    recordedBy: 'Gopi',
    recordedAt: '09:05 AM',
    totalStudents: 30,
    presentCount: 28,
    absentCount: 2,
    tenDayHistory: generateTenDayHistory([
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
    ]),
  },
  {
    id: 'rg-4',
    programName: 'Senior Secondary',
    className: 'Grade 11 - Science',
    sectionName: 'Section A',
    sessionName: 'Session 1 (Morning)',
    assignedStaff: 'Gopi',
    todayStatus: 'NOT_TAKEN',
    totalStudents: 32,
    presentCount: 0,
    absentCount: 0,
    tenDayHistory: generateTenDayHistory([
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'NOT_TAKEN',
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
    ]),
  },
  {
    id: 'rg-5',
    programName: 'Senior Secondary',
    className: 'Grade 12 - Science',
    sectionName: 'Section A',
    sessionName: 'Session 1 (Morning)',
    assignedStaff: 'Anita Sharma',
    todayStatus: 'TAKEN',
    recordedBy: 'Anita Sharma',
    recordedAt: '08:35 AM',
    totalStudents: 31,
    presentCount: 29,
    absentCount: 2,
    tenDayHistory: generateTenDayHistory([
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
    ]),
  },
  {
    id: 'rg-6',
    programName: 'Middle School',
    className: 'Grade 8',
    sectionName: 'Section C',
    sessionName: 'Full Day Session',
    assignedStaff: 'Rahul Varma',
    todayStatus: 'NOT_TAKEN',
    totalStudents: 26,
    presentCount: 0,
    absentCount: 0,
    tenDayHistory: generateTenDayHistory([
      'TAKEN', 'TAKEN', 'NOT_TAKEN', 'TAKEN', 'TAKEN',
      'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN', 'TAKEN',
    ]),
  },
];
