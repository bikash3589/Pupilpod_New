import { Department, SubjectType } from "@/types/academics";

export const departmentTypes: Department["type"][] = [
  "Learning Area",
  "Administration",
  "Scholastic",
  "Co-Scholastic",
  "Part A",
  "Part B",
];

export const initialDepartments: Department[] = [
  { id: 1, name: "Mathematics", nameShort: "MATH", type: "Learning Area", subjectCode: "MATH01", sectionIds: [5, 6, 7] },
  { id: 2, name: "English", nameShort: "ENG", type: "Learning Area", subjectCode: "ENG01", sectionIds: [5, 6, 7] },
  { id: 3, name: "Science", nameShort: "SCI", type: "Learning Area", subjectCode: "SCI01", sectionIds: [5, 6, 7] },
  { id: 4, name: "Social Studies", nameShort: "SST", type: "Scholastic", subjectCode: "SST01", sectionIds: [5, 6] },
  { id: 5, name: "Physical Education", nameShort: "PE", type: "Co-Scholastic", subjectCode: "PE01", sectionIds: [5, 6, 7] },
  { id: 6, name: "Second Language - Hindi", nameShort: "HIN", type: "Part A", subjectCode: "HIN01", sectionIds: [5, 6] },
  { id: 7, name: "Third Language - Sanskrit", nameShort: "SANS", type: "Part B", subjectCode: "SAN01", sectionIds: [7] },
  { id: 8, name: "Administration Office", nameShort: "ADMIN", type: "Administration", subjectCode: "ADM01", sectionIds: [] },
];

export const initialSubjectTypes: SubjectType[] = [
  { id: 1, name: "Core" },
  { id: 2, name: "Elective" },
  { id: 3, name: "Language" },
  { id: 4, name: "Co-Curricular" },
];
