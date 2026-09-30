export interface WorkflowState {
  orderNo: string;
  stateName: string;
  stateCode: string;
  // schema: workflow_state.display_name — shown to parents/staff, separate
  // from the internal stateName/stateCode used elsewhere in the pipeline.
  displayName: string;
  notification: string;
  // schema: workflow_state.pupilsightTemplateIDs — which email/SMS
  // template(s) actually get sent, independent of the notification method above.
  notificationTemplates: string[];
}

export interface WorkflowTransition {
  fromState: string;
  toState: string;
  displayName: string;
  enableRemark: boolean;
  transitionAction: string;
  screenOrTab: string;
  userPermissions: string[];
  autoGenerateInvoice: "Yes" | "No";
  // schema: workflow_transition.redirect_state_id — state to jump to right
  // after this transition runs (distinct from toState).
  redirectState: string;
  // schema: workflow_transition.fn_fee_admission_setting_ids — which fee
  // admission setting(s) get invoiced when autoGenerateInvoice is "Yes".
  feeAdmissionSettings: string[];
}

export interface Workflow {
  id: string;
  campaignId: string;
  createdAt: string;

  name: string;
  code: string;
  description: string;
  academicYear: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}
