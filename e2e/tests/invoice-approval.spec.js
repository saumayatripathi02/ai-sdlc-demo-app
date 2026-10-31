const { test, expect } = require('@playwright/test');
const { InvoicePage } = require('../pages/invoicePage');

test('sign in as demo.manager and reject approving the 750,000 invoice with a visible reason', async ({ page }) => {
  const invoicePage = new InvoicePage(page);

  await invoicePage.goto();
  await invoicePage.signIn('demo.manager', 'Password123!');

  await page.getByRole('button', { name: 'Approve invoice inv-750000' }).click();

  const error = page.locator('.error');
  await expect(error).toContainText('Manager approval limit exceeded: 750000 exceeds 50000.');

  await expect(page.getByRole('cell', { name: 'inv-750000' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Draft' })).toBeVisible();
});
