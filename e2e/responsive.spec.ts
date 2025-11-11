import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';

/**
 * E2E Tests: Responsive Design
 * اختبارات التصميم المتجاوب على الأجهزة المختلفة
 */
test.describe('Responsive Design', () => {
  const devices = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const device of devices) {
    test(`should display correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', testUsers.admin.email);
      await page.fill('input[type="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Check main elements are visible
      await expect(page.locator('text=لوحة التحكم')).toBeVisible();
      
      // Take screenshot for visual comparison
      await page.screenshot({ 
        path: `e2e/screenshots/dashboard-${device.name.toLowerCase()}.png`,
        fullPage: true 
      });
    });
  }

  test('should adapt navigation for mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Check for mobile menu button
    const mobileMenuButton = page.locator('[data-testid="sidebar-trigger"], button[aria-label*="menu"]');
    await expect(mobileMenuButton.first()).toBeVisible();
  });
});
