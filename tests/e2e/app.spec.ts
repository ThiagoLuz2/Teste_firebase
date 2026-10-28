import { expect, test } from '@playwright/test';

test('shows the Firebase login screen at the app root', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Esqueci minha senha' })).toBeVisible();
});

test('redirects guests away from the protected home page', async ({ page }) => {
  await page.goto('/home');
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
});
