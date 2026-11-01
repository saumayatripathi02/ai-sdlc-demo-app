/**
 * @typedef {import('../domain/invoice.js').Invoice} Invoice
 * @typedef {import('../domain/user.js').User} User
 */

/**
 * Repository contract for invoice persistence.
 *
 * @typedef {object} InvoiceRepository
 * @property {(invoiceData: Partial<Invoice>) => Invoice} createInvoice
 * @property {(invoiceId: string) => Invoice | undefined} getById
 * @property {(invoice: Invoice) => Invoice} update
 */

export {};
