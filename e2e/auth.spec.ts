import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';

/**
 * E2E Tests: Authentication Flow
 * اختبارات رحلة تسجيل الدخول والخروج
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    await page.click('text=تسجيل الدخول');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('تسجيل الدخول');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Verify successful login
    await expect(page.locator('text=لوحة التحكم')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=/خطأ|فشل|غير صحيح/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=نسيت كلمة المرور');
    
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Click user menu
    await page.click('[data-testid="user-menu"], .avatar, [aria-label*="user"]');
    
    // Click logout
    await page.click('text=تسجيل الخروج');
    
    // Verify redirect to home/login
    await expect(page).toHaveURL(/\/(login)?$/);
  });
});
