import { MarksEntry, MarksHistoryEntry } from "@/types/academics";

// keyed loosely by testId=1 (Half Yearly Examination - Grade 9), rollGroupId 5 roster (students 1-5)
export const initialMarks: MarksEntry[] = [
  { id: 1, testId: 1, studentId: 1, departmentId: 1, marksObtained: 88, status: 1, remark: "Excellent performance across all assessed areas." },
  { id: 2, testId: 1, studentId: 2, departmentId: 1, marksObtained: 76, status: 1 },
  { id: 3, testId: 1, studentId: 3, departmentId: 1, marksObtained: null, status: 0 },
  { id: 4, testId: 1, studentId: 4, departmentId: 1, marksObtained: 54, status: 0 },
  { id: 5, testId: 1, studentId: 5, departmentId: 1, marksObtained: 91, status: 0 },

  { id: 6, testId: 1, studentId: 1, departmentId: 2, marksObtained: 72, status: 0 },
  { id: 7, testId: 1, studentId: 2, departmentId: 2, marksObtained: 65, status: 0 },
  { id: 8, testId: 1, studentId: 3, departmentId: 2, marksObtained: null, status: 0 },
  { id: 9, testId: 1, studentId: 4, departmentId: 2, marksObtained: null, status: 0 },
  { id: 10, testId: 1, studentId: 5, departmentId: 2, marksObtained: 80, status: 0 },
];

// Starts empty — grows as Save is used on Marks Entry screens (ACADEMIC_DATABASE_SCHEMA.md HistoryOfStudentsMarks).
export const initialMarksHistory: MarksHistoryEntry[] = [];
