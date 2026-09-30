import { GradeSystem, GradeSystemConfiguration } from "@/types/academics";

export const initialGradeSystems: GradeSystem[] = [
  { id: 1, name: "CBSE 10-Point Scale", code: "CBSE10", passFailCondition: "Grade" },
  { id: 2, name: "Percentage Based", code: "PCT100", passFailCondition: "Marks" },
];

export const initialGradeBands: GradeSystemConfiguration[] = [
  { id: 1, gradeSystemId: 1, gradeName: "A1", gradePoint: 10, lowerLimit: 91, upperLimit: 100, rank: 1, subjectStatus: "Pass", classObtained: "Distinction", description: "Outstanding" },
  { id: 2, gradeSystemId: 1, gradeName: "A2", gradePoint: 9, lowerLimit: 81, upperLimit: 90, rank: 2, subjectStatus: "Pass", classObtained: "First Class", description: "Excellent" },
  { id: 3, gradeSystemId: 1, gradeName: "B1", gradePoint: 8, lowerLimit: 71, upperLimit: 80, rank: 3, subjectStatus: "Pass", classObtained: "First Class", description: "Very Good" },
  { id: 4, gradeSystemId: 1, gradeName: "B2", gradePoint: 7, lowerLimit: 61, upperLimit: 70, rank: 4, subjectStatus: "Pass", classObtained: "Second Class", description: "Good" },
  { id: 5, gradeSystemId: 1, gradeName: "D", gradePoint: 4, lowerLimit: 0, upperLimit: 32, rank: 9, subjectStatus: "Fail", classObtained: "Poor", description: "Needs improvement" },
];
