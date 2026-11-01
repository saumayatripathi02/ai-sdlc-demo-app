import express from 'express';
import { ApprovalService } from '../domain/approvalService.js';
import { InMemoryInvoiceRepository } from '../repositories/inMemoryInvoiceRepository.js';
import { requireSignIn, signInUser } from './signIn.js';

const repository = new InMemoryInvoiceRepository();
const service = new ApprovalService(repository);
const router = express.Router();

function mapServiceResult(response, result, successStatus = 200) {
  if (!result || result.ok === false) {
    return response.status(409).json({ ok: false, reason: result?.reason || 'Request failed.' });
  }

  return response.status(successStatus).json(result);
}

router.post('/api/signin', (request, response) => {
  const username = String(request.body?.username ?? '');
  const password = String(request.body?.password ?? '');
  const signedIn = signInUser(username, password);

  if (!signedIn) {
    return response.status(401).json({ ok: false, reason: 'Invalid username or password.' });
  }

  return response.status(200).json({ ok: true, user: signedIn.user, token: signedIn.token });
});

router.get('/api/invoices', requireSignIn, (request, response) => {
  const invoices = repository.getAll();
  return response.status(200).json({ ok: true, invoices });
});

router.post('/api/invoices/submit', requireSignIn, (request, response) => {
  const amount = Number(request.body?.amount ?? 0);
  const result = service.submit({ id: request.body?.id, amount });

  return response.status(201).json(result);
});

router.post('/api/invoices/:invoiceId/approve', requireSignIn, (request, response) => {
  const result = service.approve(request.params.invoiceId, request.user);
  return mapServiceResult(response, result);
});

router.post('/api/invoices/:invoiceId/reject', requireSignIn, (request, response) => {
  const result = service.reject(request.params.invoiceId, request.user);
  return mapServiceResult(response, result);
});

export default router;
