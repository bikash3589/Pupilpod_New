import { Remark, Skill, SubjectSkillMapping } from "@/types/academics";

export const initialSkills: Skill[] = [
  { id: 1, name: "Reading", code: "SK-READ", description: "Reading comprehension and fluency" },
  { id: 2, name: "Writing", code: "SK-WRIT", description: "Written expression and grammar" },
  { id: 3, name: "Listening", code: "SK-LIST", description: "Listening and oral comprehension" },
  { id: 4, name: "Speaking", code: "SK-SPEAK", description: "Oral communication and fluency" },
  { id: 5, name: "Problem Solving", code: "SK-PROB", description: "Analytical and quantitative reasoning" },
];

export const initialSubjectSkillMappings: SubjectSkillMapping[] = [
  { id: 1, departmentId: 2, skillId: 1 },
  { id: 2, departmentId: 2, skillId: 2 },
];

export const initialRemarks: Remark[] = [
  { id: 1, remarkCode: "R-EXC", description: "Excellent performance across all assessed areas.", departmentId: 1, skillId: 5 },
  { id: 2, remarkCode: "R-GOOD", description: "Good grasp of concepts, consistent effort.", departmentId: 2, skillId: 2 },
  { id: 3, remarkCode: "R-IMP", description: "Needs improvement in written expression.", departmentId: 2, skillId: 2 },
  { id: 4, remarkCode: "R-SAT", description: "Satisfactory progress this term.", departmentId: 3 },
];
