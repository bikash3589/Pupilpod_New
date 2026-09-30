import { AcademicProgram, AcademicClass, AcademicSection, AttendanceSession, StudentAttendanceRow } from '../types/attendance';

export const mockPrograms: AcademicProgram[] = [
  { id: 'prog-cbse', name: 'CBSE', code: 'CBSE' },
  { id: 'prog-icse', name: 'ICSE', code: 'ICSE' },
  { id: 'prog-1', name: 'Primary School (Grades 1-5)', code: 'PRI' },
  { id: 'prog-2', name: 'Middle School (Grades 6-8)', code: 'MID' },
  { id: 'prog-3', name: 'Secondary School (Grades 9-10)', code: 'SEC' },
  { id: 'prog-4', name: 'Senior Secondary (Grades 11-12)', code: 'SRSEC' },
  { id: 'prog-5', name: 'IB Diploma Programme', code: 'IBDP' },
];

export const mockClasses: AcademicClass[] = [
  // CBSE Classes
  { id: 'cls-cbse-1', programId: 'prog-cbse', name: 'Class 1', code: 'C1' },
  { id: 'cls-cbse-2', programId: 'prog-cbse', name: 'Class 2', code: 'C2' },
  { id: 'cls-cbse-3', programId: 'prog-cbse', name: 'Class 3', code: 'C3' },
  { id: 'cls-cbse-4', programId: 'prog-cbse', name: 'Class 4', code: 'C4' },
  { id: 'cls-cbse-5', programId: 'prog-cbse', name: 'Class 5', code: 'C5' },
  { id: 'cls-cbse-6', programId: 'prog-cbse', name: 'Class 6', code: 'C6' },
  { id: 'cls-cbse-7', programId: 'prog-cbse', name: 'Class 7', code: 'C7' },
  { id: 'cls-cbse-8', programId: 'prog-cbse', name: 'Class 8', code: 'C8' },
  { id: 'cls-cbse-9', programId: 'prog-cbse', name: 'Class 9', code: 'C9' },
  { id: 'cls-cbse-10', programId: 'prog-cbse', name: 'Class 10', code: 'C10' },

  // ICSE Classes
  { id: 'cls-icse-1', programId: 'prog-icse', name: 'Class 1', code: 'IC1' },
  { id: 'cls-icse-2', programId: 'prog-icse', name: 'Class 2', code: 'IC2' },

  // Primary
  { id: 'cls-1', programId: 'prog-1', name: 'Grade 1', code: 'G1' },
  { id: 'cls-2', programId: 'prog-1', name: 'Grade 2', code: 'G2' },
  { id: 'cls-3', programId: 'prog-1', name: 'Grade 3', code: 'G3' },
  { id: 'cls-4', programId: 'prog-1', name: 'Grade 4', code: 'G4' },
  { id: 'cls-5', programId: 'prog-1', name: 'Grade 5', code: 'G5' },

  // Middle
  { id: 'cls-6', programId: 'prog-2', name: 'Grade 6', code: 'G6' },
  { id: 'cls-7', programId: 'prog-2', name: 'Grade 7', code: 'G7' },
  { id: 'cls-8', programId: 'prog-2', name: 'Grade 8', code: 'G8' },

  // Secondary
  { id: 'cls-9', programId: 'prog-3', name: 'Grade 9', code: 'G9' },
  { id: 'cls-10', programId: 'prog-3', name: 'Grade 10', code: 'G10' },

  // Senior Secondary
  { id: 'cls-11', programId: 'prog-4', name: 'Grade 11 - Science', code: 'G11-SCI' },
  { id: 'cls-12', programId: 'prog-4', name: 'Grade 11 - Commerce', code: 'G11-COM' },
  { id: 'cls-13', programId: 'prog-4', name: 'Grade 12 - Science', code: 'G12-SCI' },
  { id: 'cls-14', programId: 'prog-4', name: 'Grade 12 - Commerce', code: 'G12-COM' },

  // IB
  { id: 'cls-15', programId: 'prog-5', name: 'IBDP Year 1', code: 'IB-1' },
  { id: 'cls-16', programId: 'prog-5', name: 'IBDP Year 2', code: 'IB-2' },
];

export const mockSections: AcademicSection[] = [
  // CBSE Class 1
  { id: 'sec-cbse-1a', classId: 'cls-cbse-1', name: 'A' },
  { id: 'sec-cbse-1b', classId: 'cls-cbse-1', name: 'B' },
  { id: 'sec-cbse-1c', classId: 'cls-cbse-1', name: 'C' },
  // CBSE Class 2-10
  { id: 'sec-cbse-2a', classId: 'cls-cbse-2', name: 'A' },
  { id: 'sec-cbse-3a', classId: 'cls-cbse-3', name: 'A' },
  { id: 'sec-cbse-10a', classId: 'cls-cbse-10', name: 'A' },

  // Primary
  { id: 'sec-1a', classId: 'cls-1', name: 'Section A' },
  { id: 'sec-1b', classId: 'cls-1', name: 'Section B' },
  { id: 'sec-2a', classId: 'cls-2', name: 'Section A' },
  { id: 'sec-3a', classId: 'cls-3', name: 'Section A' },
  { id: 'sec-4a', classId: 'cls-4', name: 'Section A' },
  { id: 'sec-5a', classId: 'cls-5', name: 'Section A' },

  // Middle
  { id: 'sec-6a', classId: 'cls-6', name: 'Section A' },
  { id: 'sec-7a', classId: 'cls-7', name: 'Section A' },
  { id: 'sec-8a', classId: 'cls-8', name: 'Section A' },
  { id: 'sec-8b', classId: 'cls-8', name: 'Section B' },

  // Secondary
  { id: 'sec-9a', classId: 'cls-9', name: 'Section A' },
  { id: 'sec-9b', classId: 'cls-9', name: 'Section B' },
  { id: 'sec-a', classId: 'cls-10', name: 'Section A' },
  { id: 'sec-b', classId: 'cls-10', name: 'Section B' },
  { id: 'sec-c', classId: 'cls-10', name: 'Section C' },

  // Senior Secondary
  { id: 'sec-11a', classId: 'cls-11', name: 'Section A' },
  { id: 'sec-11b', classId: 'cls-11', name: 'Section B' },
  { id: 'sec-12a', classId: 'cls-12', name: 'Section A' },
  { id: 'sec-13a', classId: 'cls-13', name: 'Section A' },
  { id: 'sec-14a', classId: 'cls-14', name: 'Section A' },

  // IB
  { id: 'sec-15a', classId: 'cls-15', name: 'Section A' },
  { id: 'sec-16a', classId: 'cls-16', name: 'Section A' },
];

export const mockSessions: AttendanceSession[] = [
  { id: 'ses-1', name: 'Session 1 (Morning)', code: 'S1', startTime: '08:30 AM', endTime: '12:30 PM' },
  { id: 'ses-2', name: 'Session 2 (Afternoon)', code: 'S2', startTime: '01:15 PM', endTime: '03:45 PM' },
  { id: 'ses-full', name: 'Full Day Session', code: 'FD', startTime: '08:30 AM', endTime: '03:45 PM' },
];

export const mockAbsenceReasons = [
  'Sick / Medical Illness',
  'Doctor / Dental Appointment',
  'Family Emergency',
  'School Sponsored Event',
  'Approved Leave of Absence',
  'Transport Breakdown',
  'Unexcused / Truancy',
  'Religious Observance',
];

export const generateMockRoster = (sectionId: string): StudentAttendanceRow[] => {
  return [
    {
      student: {
        id: 'std-101',
        admissionNo: 'ADM-2023-014',
        rollNo: '1001',
        firstName: 'Aarav',
        lastName: 'Sharma',
        gender: 'MALE',
        parentEmail: 'parent.aarav@example.com',
        phone: '+91 98765 43210'
      },
      status: 'PRESENT',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'LATE' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
    {
      student: {
        id: 'std-102',
        admissionNo: 'ADM-2023-018',
        rollNo: '1002',
        firstName: 'Ananya',
        lastName: 'Patel',
        gender: 'FEMALE',
        parentEmail: 'parent.ananya@example.com',
        phone: '+91 98765 43211'
      },
      status: 'PRESENT',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
    {
      student: {
        id: 'std-103',
        admissionNo: 'ADM-2023-022',
        rollNo: '1003',
        firstName: 'Devansh',
        lastName: 'Reddy',
        gender: 'MALE',
        parentEmail: 'parent.devansh@example.com',
        phone: '+91 98765 43212'
      },
      status: 'ABSENT',
      reason: 'Sick / Medical Illness',
      comment: 'Fever and cold, parent informed via WhatsApp note.',
      notifyParent: true,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'ABSENT' },
        { date: '23/09', status: 'ABSENT' },
        { date: '24/09', status: 'ABSENT' },
      ],
    },
    {
      student: {
        id: 'std-104',
        admissionNo: 'ADM-2023-031',
        rollNo: '1004',
        firstName: 'Diya',
        lastName: 'Nambiar',
        gender: 'FEMALE',
        parentEmail: 'parent.diya@example.com',
        phone: '+91 98765 43213'
      },
      status: 'PRESENT',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
    {
      student: {
        id: 'std-105',
        admissionNo: 'ADM-2023-035',
        rollNo: '1005',
        firstName: 'Ishaan',
        lastName: 'Verma',
        gender: 'MALE',
        parentEmail: 'parent.ishaan@example.com',
        phone: '+91 98765 43214'
      },
      status: 'LATE',
      reason: 'Transport Breakdown',
      comment: 'Arrived at 09:05 AM due to city bus delay.',
      notifyParent: true,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'LATE' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
    {
      student: {
        id: 'std-106',
        admissionNo: 'ADM-2023-042',
        rollNo: '1006',
        firstName: 'Kavya',
        lastName: 'Menon',
        gender: 'FEMALE',
        parentEmail: 'parent.kavya@example.com',
        phone: '+91 98765 43215'
      },
      status: 'PRESENT',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'EXCUSED' },
      ],
    },
    {
      student: {
        id: 'std-107',
        admissionNo: 'ADM-2023-050',
        rollNo: '1007',
        firstName: 'Rohan',
        lastName: 'Gupta',
        gender: 'MALE',
        parentEmail: 'parent.rohan@example.com',
        phone: '+91 98765 43216'
      },
      status: 'EXCUSED',
      reason: 'School Sponsored Event',
      comment: 'Inter-school athletics meet participant.',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'EXCUSED' },
        { date: '24/09', status: 'EXCUSED' },
      ],
    },
    {
      student: {
        id: 'std-108',
        admissionNo: 'ADM-2023-056',
        rollNo: '1008',
        firstName: 'Saanvi',
        lastName: 'Deshmukh',
        gender: 'FEMALE',
        parentEmail: 'parent.saanvi@example.com',
        phone: '+91 98765 43217'
      },
      status: 'PRESENT',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
    {
      student: {
        id: 'std-109',
        admissionNo: 'ADM-2023-063',
        rollNo: '1009',
        firstName: 'Vihaan',
        lastName: 'Choudhury',
        gender: 'MALE',
        parentEmail: 'parent.vihaan@example.com',
        phone: '+91 98765 43218'
      },
      status: 'PRESENT',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'LATE' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
    {
      student: {
        id: 'std-110',
        admissionNo: 'ADM-2023-071',
        rollNo: '1010',
        firstName: 'Zoya',
        lastName: 'Khan',
        gender: 'FEMALE',
        parentEmail: 'parent.zoya@example.com',
        phone: '+91 98765 43219'
      },
      status: 'HALF_DAY',
      reason: 'Doctor / Dental Appointment',
      comment: 'Left at 11:30 AM after doctor slip submitted.',
      notifyParent: false,
      history: [
        { date: '20/09', status: 'PRESENT' },
        { date: '21/09', status: 'PRESENT' },
        { date: '22/09', status: 'PRESENT' },
        { date: '23/09', status: 'PRESENT' },
        { date: '24/09', status: 'PRESENT' },
      ],
    },
  ];
};

export const mockSubjects: import('../types/attendance').AcademicSubject[] = [
  { id: 'subj-math', name: 'Mathematics', code: 'MATH-101', department: 'Mathematics & Computing', teacherName: 'Dr. Ramesh Nair' },
  { id: 'subj-phys', name: 'Physics (Core)', code: 'PHYS-101', department: 'Natural Sciences', teacherName: 'Ms. Anita Desai' },
  { id: 'subj-chem', name: 'Chemistry', code: 'CHEM-101', department: 'Natural Sciences', teacherName: 'Dr. S. K. Roy' },
  { id: 'subj-eng', name: 'English Literature', code: 'ENG-101', department: 'Languages', teacherName: 'Mr. David Clark' },
  { id: 'subj-cs', name: 'Computer Science', code: 'CS-101', department: 'Information Tech', teacherName: 'Mr. Gopichand' },
  { id: 'subj-bio', name: 'Biology & Life Sciences', code: 'BIO-101', department: 'Natural Sciences', teacherName: 'Dr. Sunita Rao' },
  { id: 'subj-hist', name: 'History & Civics', code: 'HIST-101', department: 'Social Sciences', teacherName: 'Mr. Pradeep Kumar' },
  { id: 'subj-art', name: 'Visual Arts & Design', code: 'ART-101', department: 'Fine Arts', teacherName: 'Ms. Meera Sen' },
];

export const mockRollGroups: import('../types/attendance').RollGroup[] = [
  { id: 'rg-10a', name: 'Roll Group 10A (Science Alpha)', code: 'RG-10A', programId: 'prog-3', classId: 'cls-10', sectionId: 'sec-a', tutorName: 'Mr. Gopichand', roomNo: 'Room 201', studentCount: 28 },
  { id: 'rg-10b', name: 'Roll Group 10B (Commerce Beta)', code: 'RG-10B', programId: 'prog-3', classId: 'cls-10', sectionId: 'sec-b', tutorName: 'Ms. Priya Menon', roomNo: 'Room 202', studentCount: 26 },
  { id: 'rg-09a', name: 'Roll Group 9A (Achievers)', code: 'RG-09A', programId: 'prog-3', classId: 'cls-9', sectionId: 'sec-9a', tutorName: 'Dr. Ramesh Nair', roomNo: 'Room 104', studentCount: 30 },
  { id: 'rg-cbse-1a', name: 'Roll Group CBSE 1A (Tiny Sprouts)', code: 'RG-C1A', programId: 'prog-cbse', classId: 'cls-cbse-1', sectionId: 'sec-cbse-1a', tutorName: 'Ms. Anita Desai', roomNo: 'Primary Wing 101', studentCount: 25 },
  { id: 'rg-12sci', name: 'Senior Advisory 12 Science', code: 'RG-12SCI', programId: 'prog-4', classId: 'cls-13', sectionId: 'sec-13a', tutorName: 'Dr. S. K. Roy', roomNo: 'Lab Building 302', studentCount: 22 },
];

export const mockTimetableSlots: import('../types/attendance').TimetablePeriodSlot[] = [
  { id: 'slot-1', periodNo: 1, periodName: 'Period 1', startTime: '08:30 AM', endTime: '09:15 AM', subjectName: 'Mathematics', subjectCode: 'MATH-101', teacherName: 'Dr. Ramesh Nair', roomNo: 'Room 201', status: 'TAKEN', presentCount: 27, totalStudents: 28, recordedBy: 'Dr. Ramesh Nair', recordedAt: '08:35 AM' },
  { id: 'slot-2', periodNo: 2, periodName: 'Period 2', startTime: '09:20 AM', endTime: '10:05 AM', subjectName: 'Physics (Core)', subjectCode: 'PHYS-101', teacherName: 'Ms. Anita Desai', roomNo: 'Physics Lab', status: 'TAKEN', presentCount: 26, totalStudents: 28, recordedBy: 'Ms. Anita Desai', recordedAt: '09:25 AM' },
  { id: 'slot-3', periodNo: 3, periodName: 'Period 3', startTime: '10:10 AM', endTime: '10:55 AM', subjectName: 'English Literature', subjectCode: 'ENG-101', teacherName: 'Mr. David Clark', roomNo: 'Room 201', status: 'NOT_TAKEN', totalStudents: 28 },
  { id: 'slot-break', periodNo: 0, periodName: 'Short Recess', startTime: '10:55 AM', endTime: '11:15 AM', subjectName: 'Morning Break', subjectCode: 'RECESS', teacherName: 'Duty Staff', roomNo: 'Courtyard', status: 'BREAK' },
  { id: 'slot-4', periodNo: 4, periodName: 'Period 4', startTime: '11:15 AM', endTime: '12:00 PM', subjectName: 'Chemistry', subjectCode: 'CHEM-101', teacherName: 'Dr. S. K. Roy', roomNo: 'Chem Lab 2', status: 'NOT_TAKEN', totalStudents: 28 },
  { id: 'slot-5', periodNo: 5, periodName: 'Period 5', startTime: '12:05 PM', endTime: '12:50 PM', subjectName: 'Computer Science', subjectCode: 'CS-101', teacherName: 'Mr. Gopichand', roomNo: 'Computer Lab 1', status: 'NOT_TAKEN', totalStudents: 28 },
  { id: 'slot-lunch', periodNo: 0, periodName: 'Lunch Break', startTime: '12:50 PM', endTime: '01:30 PM', subjectName: 'Lunch Break', subjectCode: 'LUNCH', teacherName: 'Cafeteria Staff', roomNo: 'Dining Hall', status: 'BREAK' },
  { id: 'slot-6', periodNo: 6, periodName: 'Period 6', startTime: '01:30 PM', endTime: '02:15 PM', subjectName: 'Biology & Life Sciences', subjectCode: 'BIO-101', teacherName: 'Dr. Sunita Rao', roomNo: 'Room 201', status: 'NOT_TAKEN', totalStudents: 28 },
  { id: 'slot-7', periodNo: 7, periodName: 'Period 7', startTime: '02:20 PM', endTime: '03:05 PM', subjectName: 'Visual Arts & Design', subjectCode: 'ART-101', teacherName: 'Ms. Meera Sen', roomNo: 'Art Studio', status: 'NOT_TAKEN', totalStudents: 28 },
];
