export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY' | 'UNRECORDED';

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  avatar?: string;
  phone?: string;
  parentEmail?: string;
}

export interface StudentAttendanceRow {
  student: Student;
  status: AttendanceStatus;
  reason?: string;
  comment?: string;
  notifyParent: boolean;
  history: Array<{
    date: string;
    status: AttendanceStatus;
  }>;
  isDirty?: boolean;
  lastSavedAt?: string;
  lastSavedBy?: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
}

export interface AcademicClass {
  id: string;
  programId: string;
  name: string;
  code: string;
}

export interface AcademicSection {
  id: string;
  classId: string;
  name: string;
}

export interface AttendanceSession {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
}

export interface FilterState {
  programId: string;
  classId: string;
  sectionId: string;
  date: string;
  sessionId: string;
  searchQuery: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  department?: string;
  teacherName?: string;
}

export interface RollGroup {
  id: string;
  name: string;
  code: string;
  programId: string;
  classId?: string;
  sectionId?: string;
  tutorName: string;
  roomNo: string;
  studentCount: number;
}

export interface TimetablePeriodSlot {
  id: string;
  periodNo: number;
  periodName: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  roomNo: string;
  status: 'TAKEN' | 'NOT_TAKEN' | 'NOT_TIMETABLED' | 'BREAK';
  presentCount?: number;
  totalStudents?: number;
  recordedBy?: string;
  recordedAt?: string;
}

export interface PersonPeriodRecord {
  periodNo: number;
  periodName: string;
  subjectName: string;
  timeRange: string;
  teacherName: string;
  status: AttendanceStatus;
  reason?: string;
  comment?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor?: string;
}

export interface HistoryDayCell {
  date: string;
  dayName: string;
  status: 'TAKEN' | 'NOT_TAKEN' | 'HOLIDAY' | 'WEEKEND';
  takenCount?: number;
  totalStudents?: number;
}

export interface DailyRollGroupRow {
  id: string;
  programName: string;
  className: string;
  sectionName: string;
  sessionName: string;
  assignedStaff: string;
  todayStatus: 'TAKEN' | 'NOT_TAKEN' | 'NOT_TIMETABLED';
  recordedBy?: string;
  recordedAt?: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  tenDayHistory: HistoryDayCell[];
}

export interface AttendanceConfiguration {
  id: string;
  organisation: string;
  academicYear: string;
  classes: string[];
  attendanceType: 'Session' | 'Subject' | 'Both';
  lockDays?: number;
  autoLock?: boolean;
  smsNotification?: boolean;
  sessions?: Array<{
    sessionNumber: number;
    sessionName: string;
    startTime?: string;
    endTime?: string;
  }>;
  createdAt?: string;
}

export interface SmsTemplate {
  id: string;
  siNo: number;
  templateName: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  entities: string[];
  messageBody?: string;
  createdAt?: string;
}

export interface BlockedAttendanceDate {
  id: string;
  slNo: number;
  name: string;
  program: string;
  className: string;
  section: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason?: string;
}

export interface FutureAbsenceRecord {
  id: string;
  slNo: number;
  studentId: string;
  studentName: string;
  admissionNo: string;
  rollNo: string;
  program: string;
  className: string;
  section: string;
  fromDate: string;
  toDate: string;
  session: string;
  reason: string;
  remarks?: string;
  notifyParent: boolean;
  status: 'Upcoming' | 'Approved' | 'Active' | 'Completed' | 'Cancelled';
  recordedBy: string;
  recordedAt: string;
}
