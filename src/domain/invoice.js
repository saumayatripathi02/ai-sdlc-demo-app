export const InvoiceStatus = Object.freeze({
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'PendingApproval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
});

export class Invoice {
  constructor({ id, amount, status = InvoiceStatus.DRAFT, approvals = [] } = {}) {
    this.id = id;
    this.amount = Number(amount);
    this.status = status;
    this.approvals = Array.isArray(approvals) ? approvals.map((approval) => ({ ...approval })) : [];
  }
}
