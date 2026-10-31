const state = {
  token: '',
  user: null
};

const signInForm = document.getElementById('signInForm');
const submitInvoiceForm = document.getElementById('submitInvoiceForm');
const invoiceTableBody = document.getElementById('invoiceTableBody');
const signedInUser = document.getElementById('signedInUser');
const errorReason = document.getElementById('errorReason');

function setError(message) {
  errorReason.textContent = message || '';
}

function setSignedInUser(user) {
  if (!user) {
    signedInUser.textContent = 'Not signed in.';
    return;
  }

  signedInUser.textContent = `Signed in as ${user.name} (${user.role})`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.reason || 'Request failed.');
  }

  return data;
}

async function fetchInvoices() {
  const payload = await apiRequest('/api/invoices');
  renderInvoices(payload.invoices || []);
}

function renderInvoices(invoices) {
  invoiceTableBody.innerHTML = '';

  if (!invoices.length) {
    invoiceTableBody.innerHTML = '<tr><td colspan="5">No invoices found.</td></tr>';
    return;
  }

  for (const invoice of invoices) {
    const row = document.createElement('tr');
    const approvalSummary = (invoice.approvals || []).map((approval) => `${approval.userName} (${approval.role})`).join(', ') || 'None';

    row.innerHTML = `
      <td>${invoice.id}</td>
      <td>$${Number(invoice.amount).toLocaleString()}</td>
      <td class="status">${invoice.status}</td>
      <td>${approvalSummary}</td>
      <td>
        <button type="button" class="approve-button" data-invoice-id="${invoice.id}" aria-label="Approve invoice ${invoice.id}">Approve</button>
        <button type="button" class="secondary reject-button" data-invoice-id="${invoice.id}" aria-label="Reject invoice ${invoice.id}">Reject</button>
      </td>
    `;

    invoiceTableBody.appendChild(row);
  }

  invoiceTableBody.querySelectorAll('.approve-button').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        setError('');
        await apiRequest(`/api/invoices/${button.dataset.invoiceId}/approve`, { method: 'POST' });
        await fetchInvoices();
      } catch (error) {
        setError(error.message);
      }
    });
  });

  invoiceTableBody.querySelectorAll('.reject-button').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        setError('');
        await apiRequest(`/api/invoices/${button.dataset.invoiceId}/reject`, { method: 'POST' });
        await fetchInvoices();
      } catch (error) {
        setError(error.message);
      }
    });
  });
}

signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setError('');

  try {
    const formData = new FormData(signInForm);
    const username = String(formData.get('username') || '');
    const password = String(formData.get('password') || '');

    const payload = await apiRequest('/api/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    state.token = payload.token;
    state.user = payload.user;
    setSignedInUser(state.user);
    await fetchInvoices();
  } catch (error) {
    setError(error.message);
  }
});

submitInvoiceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setError('');

  try {
    const formData = new FormData(submitInvoiceForm);
    const amount = Number(formData.get('amount') || 0);

    if (!state.token) {
      throw new Error('Sign in first.');
    }

    await apiRequest('/api/invoices/submit', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });

    submitInvoiceForm.reset();
    await fetchInvoices();
  } catch (error) {
    setError(error.message);
  }
});

setSignedInUser(null);
