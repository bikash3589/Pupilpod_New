import { AcademicYear, Program, RollGroup, StudentLite, YearGroup } from "@/types/academics";

export const academicYears: AcademicYear[] = [
  { id: 1, name: "2026-2027", isCurrent: true },
  { id: 2, name: "2025-2026" },
  { id: 3, name: "2024-2025" },
];

export const programs: Program[] = [
  { id: 1, name: "CBSE" },
  { id: 2, name: "ICSE" },
];

export const yearGroups: YearGroup[] = [
  { id: 1, programId: 1, name: "Class 1" },
  { id: 2, programId: 1, name: "Class 2" },
  { id: 3, programId: 1, name: "Class 3" },
  { id: 4, programId: 1, name: "Grade 6" },
  { id: 5, programId: 1, name: "Grade 7" },
  { id: 6, programId: 1, name: "Grade 8" },
  { id: 7, programId: 1, name: "Grade 9" },
  { id: 8, programId: 1, name: "Grade 10" },
];

export const rollGroups: RollGroup[] = [
  { id: 1, yearGroupId: 1, name: "1-A" },
  { id: 2, yearGroupId: 1, name: "1-B" },
  { id: 3, yearGroupId: 4, name: "6-A" },
  { id: 4, yearGroupId: 4, name: "6-B" },
  { id: 5, yearGroupId: 7, name: "9-A" },
  { id: 6, yearGroupId: 7, name: "9-B" },
  { id: 7, yearGroupId: 8, name: "10-A" },
  // Every YearGroup needs at least one Section, otherwise its "Select Section" dropdown
  // is empty and no filter-driven screen (Marks Entry, Curriculum, Electives, ...) can be used for it.
  { id: 8, yearGroupId: 2, name: "2-A" },
  { id: 9, yearGroupId: 2, name: "2-B" },
  { id: 10, yearGroupId: 3, name: "3-A" },
  { id: 11, yearGroupId: 3, name: "3-B" },
  { id: 12, yearGroupId: 5, name: "7-A" },
  { id: 13, yearGroupId: 5, name: "7-B" },
  { id: 14, yearGroupId: 6, name: "8-A" },
  { id: 15, yearGroupId: 6, name: "8-B" },
];

export function yearGroupsForProgram(programId: number | null) {
  if (!programId) return [];
  return yearGroups.filter((yg) => yg.programId === programId);
}

export function rollGroupsForYearGroup(yearGroupId: number | null) {
  if (!yearGroupId) return [];
  return rollGroups.filter((rg) => rg.yearGroupId === yearGroupId);
}

export const students: StudentLite[] = [
  { id: 1, admissionNo: "ADM-1001", name: "Aarav Shah", programId: 1, yearGroupId: 7, rollGroupId: 5 },
  { id: 2, admissionNo: "ADM-1002", name: "Diya Patel", programId: 1, yearGroupId: 7, rollGroupId: 5 },
  { id: 3, admissionNo: "ADM-1003", name: "Kabir Rao", programId: 1, yearGroupId: 7, rollGroupId: 5 },
  { id: 4, admissionNo: "ADM-1004", name: "Meera Nair", programId: 1, yearGroupId: 7, rollGroupId: 6 },
  { id: 5, admissionNo: "ADM-1005", name: "Vihaan Gupta", programId: 1, yearGroupId: 7, rollGroupId: 6 },
  { id: 6, admissionNo: "ADM-1006", name: "Anaya Iyer", programId: 1, yearGroupId: 8, rollGroupId: 7 },
  { id: 7, admissionNo: "ADM-1007", name: "Reyansh Kumar", programId: 1, yearGroupId: 8, rollGroupId: 7 },
  { id: 8, admissionNo: "ADM-1008", name: "Ishita Verma", programId: 1, yearGroupId: 4, rollGroupId: 3 },
  // Every Section needs a roster, otherwise Marks Entry / roster-driven screens show
  // "no students" for any class the demo data hadn't already touched.
  { id: 9, admissionNo: "ADM-2001", name: "Advait Mehta", programId: 2, yearGroupId: 1, rollGroupId: 1 },
  { id: 10, admissionNo: "ADM-2002", name: "Sara Khan", programId: 2, yearGroupId: 1, rollGroupId: 1 },
  { id: 11, admissionNo: "ADM-2003", name: "Riya Sharma", programId: 2, yearGroupId: 1, rollGroupId: 2 },
  { id: 12, admissionNo: "ADM-2004", name: "Arjun Verma", programId: 2, yearGroupId: 1, rollGroupId: 2 },
  { id: 13, admissionNo: "ADM-2005", name: "Priya Joshi", programId: 1, yearGroupId: 4, rollGroupId: 4 },
  { id: 14, admissionNo: "ADM-2006", name: "Vivaan Reddy", programId: 1, yearGroupId: 4, rollGroupId: 4 },
  { id: 15, admissionNo: "ADM-2007", name: "Ananya Singh", programId: 2, yearGroupId: 2, rollGroupId: 8 },
  { id: 16, admissionNo: "ADM-2008", name: "Rohan Das", programId: 2, yearGroupId: 2, rollGroupId: 8 },
  { id: 17, admissionNo: "ADM-2009", name: "Zara Khan", programId: 2, yearGroupId: 2, rollGroupId: 9 },
  { id: 18, admissionNo: "ADM-2010", name: "Kiaan Bose", programId: 2, yearGroupId: 2, rollGroupId: 9 },
  { id: 19, admissionNo: "ADM-2011", name: "Myra Kapoor", programId: 2, yearGroupId: 3, rollGroupId: 10 },
  { id: 20, admissionNo: "ADM-2012", name: "Yash Malhotra", programId: 2, yearGroupId: 3, rollGroupId: 10 },
  { id: 21, admissionNo: "ADM-2013", name: "Aadhya Pillai", programId: 2, yearGroupId: 3, rollGroupId: 11 },
  { id: 22, admissionNo: "ADM-2014", name: "Dev Chawla", programId: 2, yearGroupId: 3, rollGroupId: 11 },
  { id: 23, admissionNo: "ADM-2015", name: "Pihu Agarwal", programId: 1, yearGroupId: 5, rollGroupId: 12 },
  { id: 24, admissionNo: "ADM-2016", name: "Aryan Bhatt", programId: 1, yearGroupId: 5, rollGroupId: 12 },
  { id: 25, admissionNo: "ADM-2017", name: "Naina Rao", programId: 1, yearGroupId: 5, rollGroupId: 13 },
  { id: 26, admissionNo: "ADM-2018", name: "Om Trivedi", programId: 1, yearGroupId: 5, rollGroupId: 13 },
  { id: 27, admissionNo: "ADM-2019", name: "Tanvi Menon", programId: 1, yearGroupId: 6, rollGroupId: 14 },
  { id: 28, admissionNo: "ADM-2020", name: "Ishaan Nair", programId: 1, yearGroupId: 6, rollGroupId: 14 },
  { id: 29, admissionNo: "ADM-2021", name: "Riddhi Shah", programId: 1, yearGroupId: 6, rollGroupId: 15 },
  { id: 30, admissionNo: "ADM-2022", name: "Aarush Iyer", programId: 1, yearGroupId: 6, rollGroupId: 15 },
];

export function studentsForRollGroup(rollGroupId: number | null) {
  if (!rollGroupId) return [];
  return students.filter((s) => s.rollGroupId === rollGroupId);
}

let idCounter = 0;
/**
 * Timestamp + monotonic-tick based id — safe across page reloads now that stores
 * persist to localStorage (a simple incrementing counter would collide with ids
 * saved in a previous session once it resets on reload).
 */
export function nextId() {
  idCounter += 1;
  return Date.now() * 1000 + (idCounter % 1000);
}
