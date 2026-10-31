export class FakeInvoiceRepository {
  constructor(initialInvoices = []) {
    this.invoices = new Map(initialInvoices.map((invoice) => [invoice.id, structuredClone(invoice)]));
  }

  createInvoice(invoiceData = {}) {
    const invoice = {
      id: invoiceData.id ?? 'invoice-created',
      amount: Number(invoiceData.amount ?? 0),
      status: invoiceData.status ?? 'Draft',
      approvals: [...(invoiceData.approvals ?? [])]
    };

    this.invoices.set(invoice.id, structuredClone(invoice));
    return structuredClone(invoice);
  }

  getById(invoiceId) {
    const invoice = this.invoices.get(invoiceId);
    return invoice ? structuredClone(invoice) : undefined;
  }

  update(invoice) {
    this.invoices.set(invoice.id, structuredClone(invoice));
    return structuredClone(invoice);
  }
}
