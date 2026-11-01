const { expect } = require('@playwright/test');

class InvoicePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async signIn(username, password) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async approveInvoice(invoiceId) {
    const row = this.page.getByRole('row').filter({ has: this.page.getByText(invoiceId) });
    await row.getByRole('button', { name: `Approve invoice ${invoiceId}` }).click();
  }

  async getErrorText() {
    return this.page.getByText(/.*/).locator('..');
  }

  async getInvoiceStatus(invoiceId) {
    const row = this.page.getByRole('row').filter({ has: this.page.getByText(invoiceId) });
    return row.locator('td').nth(2).textContent();
  }
}

module.exports = { InvoicePage };
