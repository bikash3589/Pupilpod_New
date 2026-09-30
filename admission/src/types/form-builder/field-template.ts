import { FieldType } from "./field";

export interface FieldTemplate {

    // Database Primary Key
    id:number;

    // Unique identifier
    templateId:string;

    // Display name in sidebar
    name:string;

    // Built-in or Admin Created
    builtIn:boolean;

    // Field type
    type:FieldType;

    // Default values

    defaultLabel:string;

    defaultPlaceholder:string;

    defaultRequired:boolean;

    defaultWidth:"25"|"50"|"75"|"100";

    defaultOptions:string[];
}