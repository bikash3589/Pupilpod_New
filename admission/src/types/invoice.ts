// The schema has no single Invoice table — this shape is a synthesized view
// over fn_fee_invoice (definition), fn_fee_invoice_applicant_assign
// (applicant <-> invoice + invoiceStatus), and fn_fees_applicant_collection
// (payments, i.e. paidAmount). None of those has a campaignId column either;
// a campaign only reaches its invoices indirectly via fn_fee_structure or
// via the applicant's form submission — campaignId here is a UI-only
// convenience to scope this page's list, not a real FK.
export type InvoiceStatus = "Not Paid" | "Paid" | "Partial Paid" | "Cancelled";

export interface Invoice {
  id: string;
  campaignId: string;
  createdAt: string;

  studentName: string;
  program: string;
  class: string;
  academicYear: string;
  invoiceTitle: string;
  invoiceNumber: string;
  // What's being charged (e.g. "Tuition", "Admission") — schema: fn_fee_items.
  feeItem: string;
  // The bank/GL account the invoice posts against — schema: fn_fees_head.
  // Named "Ac Head" in the legacy UI; kept distinct from feeItem above
  // because fn_fees_head means "accounting head", not "type of fee".
  accountHead: string;
  dueDate: string; // "YYYY-MM-DD" from <input type="date">
  status: InvoiceStatus;
  amount: number;
  paidAmount: number;
}
