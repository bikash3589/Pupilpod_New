// export interface SubmissionAnswer {
//   fieldId: string;

//   value: string;
// }

// export interface Submission {
//   id: string;

//   formId: string;

//   answers: SubmissionAnswer[];

//   submittedAt: Date;
// }
export interface SubmissionAnswer {
  fieldId: string;

  value: string;
}

export interface Submission {
  id: number;

  formId: number;

  answers: SubmissionAnswer[];

  submittedAt: Date;
}