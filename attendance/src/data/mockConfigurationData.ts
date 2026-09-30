import { AttendanceConfiguration } from '../types/attendance';

export const initialConfigurations: AttendanceConfiguration[] = [
  {
    id: 'cfg-cbse-primary',
    organisation: 'CBSE',
    academicYear: '2026-2027',
    classes: ['Class 1', 'Class 2', 'Class 3'],
    attendanceType: 'Session',
    lockDays: 3,
    autoLock: true,
    smsNotification: true,
    sessions: [
      { sessionNumber: 1, sessionName: 'Morning Session', startTime: '08:30 AM', endTime: '12:30 PM' },
      { sessionNumber: 2, sessionName: 'Afternoon Session', startTime: '01:15 PM', endTime: '03:45 PM' },
    ],
    createdAt: '2026-06-15',
  },
];
