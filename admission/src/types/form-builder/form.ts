import { Field } from "./field";

export interface Form {
  id: number;

  title: string;

  description: string;

  fields: Field[];

  createdAt: Date;

  updatedAt: Date;
}