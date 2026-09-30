import { SmsTemplate } from '../types/attendance';

export const initialSmsTemplates: SmsTemplate[] = [
  {
    id: 'tmpl-1',
    siNo: 1,
    templateName: 'Absent SMS',
    status: 'Active',
    createdBy: 'Anand Pupilpod',
    entities: ['Student_name', 'Attendance_date'],
    messageBody: 'Dear Parent, your ward {Student_name} was marked ABSENT on {Attendance_date}. Please contact the school office if this was unanticipated.',
    createdAt: '2026-04-10',
  },
];

export const availableEntities = [
  'Student_name',
  'Attendance_date',
  'Class_name',
  'Section_name',
  'Session_name',
  'Reason',
  'School_name',
];
