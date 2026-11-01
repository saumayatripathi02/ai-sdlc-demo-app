import { InvoiceStatus } from './invoice.js';

export class ApprovalService {
  constructor(repository) {
    this.repository = repository;
  }

  submit(invoiceData) {
    const invoice = this.repository.createInvoice(invoiceData);
    return {
      ok: true,
      invoice
    };
  }

  approve(invoiceId, user) {
    const invoice = this.repository.getById(invoiceId);

    if (!invoice) {
      return { ok: false, reason: 'Invoice not found.' };
    }

    if (invoice.status === InvoiceStatus.APPROVED) {
      return { ok: false, reason: 'Invoice already approved.' };
    }

    if (invoice.status === InvoiceStatus.REJECTED) {
      return { ok: false, reason: 'Invoice rejected and cannot be approved.' };
    }

    if (!user || !user.id || !user.role) {
      return { ok: false, reason: 'Approver is required.' };
    }

    const roleIsAllowed = user.role === 'Manager' || user.role === 'Director';
    if (!roleIsAllowed) {
      return { ok: false, reason: 'Only Managers and Directors may approve invoices.' };
    }

    const isHighValueInvoice = invoice.amount > 500000;

    if (isHighValueInvoice) {
      const approvalExists = invoice.approvals.some((approval) => approval.userId === user.id);
      if (approvalExists) {
        return { ok: false, reason: 'The same user cannot approve twice on one invoice.' };
      }

      if (invoice.approvals.length === 0) {
        const approval = {
          userId: user.id,
          userName: user.name,
          role: user.role
        };

        invoice.approvals.push(approval);
        invoice.status = InvoiceStatus.PENDING_APPROVAL;

        const updatedInvoice = this.repository.update(invoice);
        return { ok: true, invoice: updatedInvoice, reason: 'PendingApproval' };
      }

      if (user.role !== 'Director') {
        return { ok: false, reason: 'The second approver must be a Director.' };
      }

      const approval = {
        userId: user.id,
        userName: user.name,
        role: user.role
      };

      invoice.approvals.push(approval);
      invoice.status = InvoiceStatus.APPROVED;

      const updatedInvoice = this.repository.update(invoice);
      return { ok: true, invoice: updatedInvoice, reason: 'Approved' };
    }

    const maximumAmount = user.role === 'Manager' ? 50000 : 500000;
    if (invoice.amount > maximumAmount) {
      return {
        ok: false,
        reason: `${user.role} approval limit exceeded: ${invoice.amount} exceeds ${maximumAmount}.`
      };
    }

    const approval = {
      userId: user.id,
      userName: user.name,
      role: user.role
    };

    invoice.approvals.push(approval);
    invoice.status = InvoiceStatus.APPROVED;

    const updatedInvoice = this.repository.update(invoice);
    return { ok: true, invoice: updatedInvoice, reason: 'Approved' };
  }

  reject(invoiceId, user) {
    const invoice = this.repository.getById(invoiceId);

    if (!invoice) {
      return { ok: false, reason: 'Invoice not found.' };
    }

    if (invoice.status === InvoiceStatus.APPROVED) {
      return { ok: false, reason: 'Approved invoice cannot be rejected.' };
    }

    if (invoice.status === InvoiceStatus.REJECTED) {
      return { ok: false, reason: 'Invoice already rejected.' };
    }

    if (!user || !user.id || !user.role) {
      return { ok: false, reason: 'Rejection requires an actor.' };
    }

    const roleIsAllowed = user.role === 'Manager' || user.role === 'Director';
    if (!roleIsAllowed) {
      return { ok: false, reason: 'Only Managers and Directors may reject invoices.' };
    }

    invoice.status = InvoiceStatus.REJECTED;
    invoice.approvals = [...invoice.approvals];

    const updatedInvoice = this.repository.update(invoice);
    return { ok: true, invoice: updatedInvoice, reason: 'Rejected' };
  }
}
