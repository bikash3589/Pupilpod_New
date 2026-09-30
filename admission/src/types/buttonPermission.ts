export interface ModuleButton {
  id: string;
  name: string;
}

export interface StaffMember {
  id: string;
  name: string;
}

// buttonId -> staff ids granted access to that button
export type ButtonPermissionGrants = Record<string, string[]>;
