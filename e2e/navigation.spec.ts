import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';

/**
 * E2E Tests: Navigation and User Journey
 * اختبارات التنقل بين الصفحات
 */
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate through sidebar menu items', async ({ page }) => {
    const menuItems = [
      { text: 'لوحة التحكم', url: '/dashboard' },
      { text: 'الطلبات', url: '/requests' },
      { text: 'العقارات', url: '/properties' },
      { text: 'المشاريع', url: '/projects' },
    ];

    for (const item of menuItems) {
      const menuLink = page.locator(`nav a:has-text("${item.text}")`).first();
      
      if (await menuLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuLink.click();
        await page.waitForURL(`**${item.url}`, { timeout: 5000 });
        await expect(page).toHaveURL(new RegExp(item.url));
      }
    }
  });

  test('should navigate back to dashboard from any page', async ({ page }) => {
    // Go to another page
    await page.goto('/requests');
    
    // Click dashboard link
    const dashboardLink = page.locator('nav a:has-text("لوحة التحكم"), a[href="/dashboard"]').first();
    await dashboardLink.click();
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should open and close sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Click menu toggle
    const menuToggle = page.locator('[data-testid="sidebar-trigger"], button[aria-label*="menu"]').first();
    
    if (await menuToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuToggle.click();
      
      // Sidebar should be visible
      const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
      await expect(sidebar.first()).toBeVisible();
      
      // Close sidebar
      await menuToggle.click();
    }
  });

  test('should maintain navigation state after page reload', async ({ page }) => {
    await page.goto('/requests');
    await page.reload();
    
    await expect(page).toHaveURL(/.*requests/);
  });

  test('should handle browser back and forward buttons', async ({ page }) => {
    // Navigate through pages
    await page.goto('/dashboard');
    await page.goto('/requests');
    await page.goto('/properties');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/.*requests/);
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/.*requests/);
  });
});
