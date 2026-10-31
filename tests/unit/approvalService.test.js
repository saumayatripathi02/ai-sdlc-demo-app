import { describe, expect, it } from 'vitest';
import { ApprovalService } from '../../src/domain/approvalService.js';
import { InvoiceStatus } from '../../src/domain/invoice.js';

function buildRepository(initialInvoices = []) {
  const invoices = new Map(initialInvoices.map((invoice) => [invoice.id, { ...invoice, approvals: [...(invoice.approvals ?? [])] }]));

  return {
    createInvoice(invoiceData) {
      const invoice = {
        id: invoiceData.id ?? 'inv-1',
        amount: invoiceData.amount ?? 0,
        status: invoiceData.status ?? InvoiceStatus.DRAFT,
        approvals: [...(invoiceData.approvals ?? [])]
      };
      invoices.set(invoice.id, invoice);
      return structuredClone(invoice);
    },
    getById(invoiceId) {
      const invoice = invoices.get(invoiceId);
      return invoice ? structuredClone(invoice) : undefined;
    },
    update(invoice) {
      invoices.set(invoice.id, structuredClone(invoice));
      return structuredClone(invoice);
    }
  };
}

describe('ApprovalService single-approver limits', () => {
  it('accepts a Manager approval at exactly 50,000', () => {
    const repository = buildRepository([
      { id: 'inv-manager-50000', amount: 50000, status: InvoiceStatus.DRAFT, approvals: [] }
    ]);
    const service = new ApprovalService(repository);

    const result = service.approve('inv-manager-50000', { id: 'manager-1', name: 'Ava', role: 'Manager' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('Approved');
    expect(result.invoice.status).toBe(InvoiceStatus.APPROVED);
  });

  it('rejects a Manager approval above 50,000 and leaves the invoice unchanged', () => {
    const repository = buildRepository([
      { id: 'inv-manager-50001', amount: 50001, status: InvoiceStatus.DRAFT, approvals: [] }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-manager-50001');

    const result = service.approve('inv-manager-50001', { id: 'manager-1', name: 'Ava', role: 'Manager' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Manager approval limit exceeded: 50001 exceeds 50000.');
    expect(repository.getById('inv-manager-50001')).toEqual(before);
  });

  it('accepts a Director approval at exactly 500,000', () => {
    const repository = buildRepository([
      { id: 'inv-director-500000', amount: 500000, status: InvoiceStatus.DRAFT, approvals: [] }
    ]);
    const service = new ApprovalService(repository);

    const result = service.approve('inv-director-500000', { id: 'director-1', name: 'Liam', role: 'Director' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('Approved');
    expect(result.invoice.status).toBe(InvoiceStatus.APPROVED);
  });

  it('rejects a Director approval above 500,000 and leaves the invoice unchanged', () => {
    const repository = buildRepository([
      { id: 'inv-director-500001', amount: 500001, status: InvoiceStatus.DRAFT, approvals: [] }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-director-500001');

    const result = service.approve('inv-director-500001', { id: 'director-1', name: 'Liam', role: 'Director' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('PendingApproval');
    expect(result.invoice.status).toBe(InvoiceStatus.PENDING_APPROVAL);
    expect(result.invoice.approvals).toEqual([{ userId: 'director-1', userName: 'Liam', role: 'Director' }]);
    expect(repository.getById('inv-director-500001')).toEqual(result.invoice);
    expect(repository.getById('inv-director-500001')).not.toEqual(before);
  });

  it('rejects a Manager approval on a 75,000 invoice because it exceeds the Manager limit', () => {
    const repository = buildRepository([
      { id: 'inv-manager-75000', amount: 75000, status: InvoiceStatus.DRAFT, approvals: [] }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-manager-75000');

    const result = service.approve('inv-manager-75000', { id: 'manager-1', name: 'Ava', role: 'Manager' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Manager approval limit exceeded: 75000 exceeds 50000.');
    expect(repository.getById('inv-manager-75000')).toEqual(before);
  });

  it('uses deep equality to prove a rejected approval does not modify the invoice', () => {
    const repository = buildRepository([
      {
        id: 'inv-immutable',
        amount: 75000,
        status: InvoiceStatus.DRAFT,
        approvals: [{ userId: 'old-user', userName: 'Old User', role: 'Manager' }]
      }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-immutable');

    const result = service.approve('inv-immutable', { id: 'manager-2', name: 'Second Manager', role: 'Manager' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Manager approval limit exceeded: 75000 exceeds 50000.');
    expect(repository.getById('inv-immutable')).toEqual(before);
    expect(repository.getById('inv-immutable')).toStrictEqual({
      id: 'inv-immutable',
      amount: 75000,
      status: InvoiceStatus.DRAFT,
      approvals: [{ userId: 'old-user', userName: 'Old User', role: 'Manager' }]
    });
  });
});

describe('ApprovalService two-approver rule', () => {
  it('rejects the same user approving twice on a 600,000 invoice', () => {
    const repository = buildRepository([
      {
        id: 'inv-two-approver-same-user',
        amount: 600000,
        status: InvoiceStatus.DRAFT,
        approvals: [{ userId: 'director-1', userName: 'Liam', role: 'Director' }]
      }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-two-approver-same-user');

    const result = service.approve('inv-two-approver-same-user', { id: 'director-1', name: 'Liam', role: 'Director' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('The same user cannot approve twice on one invoice.');
    expect(repository.getById('inv-two-approver-same-user')).toEqual(before);
    expect(repository.getById('inv-two-approver-same-user').approvals).toHaveLength(1);
  });

  it('rejects a Manager as the second approver on a 600,000 invoice', () => {
    const repository = buildRepository([
      {
        id: 'inv-two-approver-manager-second',
        amount: 600000,
        status: InvoiceStatus.DRAFT,
        approvals: [{ userId: 'director-1', userName: 'Liam', role: 'Director' }]
      }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-two-approver-manager-second');

    const result = service.approve('inv-two-approver-manager-second', { id: 'manager-1', name: 'Ava', role: 'Manager' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('The second approver must be a Director.');
    expect(repository.getById('inv-two-approver-manager-second')).toEqual(before);
  });

  it('keeps a 600,000 invoice pending when a Manager is the first approver', () => {
    const repository = buildRepository([
      {
        id: 'inv-two-approver-manager-first',
        amount: 600000,
        status: InvoiceStatus.DRAFT,
        approvals: []
      }
    ]);
    const service = new ApprovalService(repository);

    const result = service.approve('inv-two-approver-manager-first', { id: 'manager-1', name: 'Ava', role: 'Manager' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('PendingApproval');
    expect(result.invoice.status).toBe(InvoiceStatus.PENDING_APPROVAL);
    expect(result.invoice.approvals).toEqual([{ userId: 'manager-1', userName: 'Ava', role: 'Manager' }]);
  });

  it('rejects a second approval and leaves the invoice unchanged when the second approver is invalid', () => {
    const repository = buildRepository([
      {
        id: 'inv-two-approver-invalid',
        amount: 600000,
        status: InvoiceStatus.PENDING_APPROVAL,
        approvals: [{ userId: 'manager-1', userName: 'Ava', role: 'Manager' }]
      }
    ]);
    const service = new ApprovalService(repository);
    const before = repository.getById('inv-two-approver-invalid');

    const result = service.approve('inv-two-approver-invalid', { id: 'manager-2', name: 'Ben', role: 'Manager' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('The second approver must be a Director.');
    expect(repository.getById('inv-two-approver-invalid')).toEqual(before);
    expect(repository.getById('inv-two-approver-invalid').approvals).toEqual(before.approvals);
  });
});
