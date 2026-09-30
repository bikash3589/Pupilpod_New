import { ElectiveGroup } from "@/types/academics";

export const initialElectiveGroups: ElectiveGroup[] = [
  {
    id: 1,
    name: "Vocational Elective Group A",
    orderNo: 1,
    minSelection: 1,
    maxSelection: 1,
    academicYearId: 1,
    programId: 1,
    yearGroupId: 8,
    sectionIds: [7],
    departmentIds: [4, 5],
  },
  {
    id: 2,
    name: "Third Language Elective",
    orderNo: 2,
    minSelection: 1,
    maxSelection: 1,
    academicYearId: 1,
    programId: 1,
    yearGroupId: 7,
    sectionIds: [5, 6],
    departmentIds: [6, 7],
  },
];
