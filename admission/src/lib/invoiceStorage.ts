import type { Invoice, InvoiceStatus } from "@/types/invoice";

const STORAGE_KEY = "invoices";

export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch (err) {
    console.error("Failed to read invoices from localStorage", err);
    return [];
  }
}

export function getInvoicesByCampaign(campaignId: string): Invoice[] {
  return getInvoices().filter((invoice) => invoice.campaignId === campaignId);
}

export function saveInvoice(invoice: Invoice): void {
  const existing = getInvoices();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, invoice]));
}

export function updateInvoice(
  id: string,
  updates: Omit<Invoice, "id" | "createdAt" | "campaignId">
): Invoice | undefined {
  const invoices = getInvoices();
  const index = invoices.findIndex((invoice) => invoice.id === id);
  if (index === -1) return undefined;

  const updated: Invoice = { ...invoices[index], ...updates };
  invoices[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  return updated;
}

export function deleteInvoice(id: string): void {
  const updated = getInvoices().filter((invoice) => invoice.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteInvoices(ids: string[]): void {
  const idSet = new Set(ids);
  const updated = getInvoices().filter((invoice) => !idSet.has(invoice.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateInvoicesStatus(ids: string[], status: InvoiceStatus): void {
  const idSet = new Set(ids);
  const updated = getInvoices().map((invoice) =>
    idSet.has(invoice.id) ? { ...invoice, status } : invoice
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
