import { describe, expect, it } from 'vitest';
import { ApprovalService } from '../../src/domain/approvalService.js';
import { InvoiceStatus } from '../../src/domain/invoice.js';
import { InMemoryInvoiceRepository } from '../../src/repositories/inMemoryInvoiceRepository.js';
import { FakeInvoiceRepository } from '../../src/repositories/fakeInvoiceRepository.js';

describe('invoice repository baseline behaviour', () => {
  it('submits a new invoice as Draft', () => {
    const repository = new InMemoryInvoiceRepository();
    const service = new ApprovalService(repository);

    const result = service.submit({ id: 'new-invoice', amount: 15000 });

    expect(result.ok).toBe(true);
    expect(result.invoice.status).toBe(InvoiceStatus.DRAFT);
    expect(result.invoice.amount).toBe(15000);
  });

  it('approves an existing invoice', () => {
    const repository = new InMemoryInvoiceRepository();
    const service = new ApprovalService(repository);

    const result = service.approve('inv-10000', { id: 'manager-1', name: 'Alex', role: 'Manager' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('Approved');
    expect(result.invoice.status).toBe(InvoiceStatus.APPROVED);
    expect(result.invoice.approvals).toContainEqual({
      userId: 'manager-1',
      userName: 'Alex',
      role: 'Manager'
    });
  });

  it('rejects an existing invoice', () => {
    const repository = new InMemoryInvoiceRepository();
    const service = new ApprovalService(repository);

    const result = service.reject('inv-200000', { id: 'director-1', name: 'Jordan', role: 'Director' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('Rejected');
    expect(result.invoice.status).toBe(InvoiceStatus.REJECTED);
  });

  it('returns a not found result for an unknown invoice', () => {
    const repository = new InMemoryInvoiceRepository();
    const service = new ApprovalService(repository);

    const result = service.approve('missing-invoice', { id: 'manager-1', name: 'Alex', role: 'Manager' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Invoice not found.');
  });

  it('refuses to approve a non-pending invoice', () => {
    const repository = new FakeInvoiceRepository([
      { id: 'approved-invoice', amount: 25000, status: InvoiceStatus.APPROVED, approvals: [{ userId: 'manager-1', userName: 'Alex', role: 'Manager' }] }
    ]);
    const service = new ApprovalService(repository);

    const result = service.approve('approved-invoice', { id: 'director-1', name: 'Jordan', role: 'Director' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Invoice already approved.');
  });
});
