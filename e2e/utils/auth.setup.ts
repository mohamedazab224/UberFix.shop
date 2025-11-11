import { test as setup, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

const authFile = 'playwright/.auth/user.json';

/**
 * Authentication setup for E2E tests
 * إعداد المصادقة لاختبارات E2E
 */
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Fill in credentials
  await page.fill('input[type="email"]', testUsers.admin.email);
  await page.fill('input[type="password"]', testUsers.admin.password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for successful login and redirect
  await page.waitForURL('/dashboard', { timeout: 10000 });
  
  // Verify we're logged in
  await expect(page.locator('text=لوحة التحكم')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});
