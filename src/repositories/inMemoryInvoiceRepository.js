import { InvoiceStatus } from '../domain/invoice.js';

const defaultSeedInvoices = [
  { id: 'inv-10000', amount: 10000, status: InvoiceStatus.DRAFT, approvals: [] },
  { id: 'inv-50000', amount: 50000, status: InvoiceStatus.DRAFT, approvals: [] },
  { id: 'inv-200000', amount: 200000, status: InvoiceStatus.DRAFT, approvals: [] },
  { id: 'inv-500000', amount: 500000, status: InvoiceStatus.DRAFT, approvals: [] },
  { id: 'inv-750000', amount: 750000, status: InvoiceStatus.DRAFT, approvals: [] }
];

export class InMemoryInvoiceRepository {
  constructor(initialInvoices = defaultSeedInvoices) {
    this.invoices = new Map();

    for (const invoice of initialInvoices) {
      this.invoices.set(invoice.id, {
        ...invoice,
        approvals: [...(invoice.approvals ?? [])]
      });
    }
  }

  createInvoice(invoiceData = {}) {
    const invoice = {
      id: invoiceData.id ?? `inv-${Date.now()}`,
      amount: Number(invoiceData.amount ?? 0),
      status: invoiceData.status ?? InvoiceStatus.DRAFT,
      approvals: [...(invoiceData.approvals ?? [])]
    };

    this.invoices.set(invoice.id, invoice);
    return structuredClone(invoice);
  }

  getById(invoiceId) {
    const invoice = this.invoices.get(invoiceId);
    return invoice ? structuredClone(invoice) : undefined;
  }

  getAll() {
    return Array.from(this.invoices.values()).map((invoice) => structuredClone(invoice));
  }

  update(invoice) {
    const nextInvoice = {
      ...invoice,
      approvals: [...(invoice.approvals ?? [])]
    };

    this.invoices.set(nextInvoice.id, nextInvoice);
    return structuredClone(nextInvoice);
  }
}
