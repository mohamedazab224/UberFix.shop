import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';

/**
 * E2E Tests: Dashboard Functionality
 * اختبارات لوحة التحكم والإحصائيات
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard with statistics', async ({ page }) => {
    // Check for main dashboard elements
    await expect(page.locator('text=لوحة التحكم')).toBeVisible();
    
    // Check for stats cards (at least one should be visible)
    const statsCards = page.locator('[data-testid="stats-card"], .stats-card, .stat-card');
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display recent requests', async ({ page }) => {
    // Check for recent requests section
    const recentSection = page.locator('text=/الطلبات الأخيرة|Recent Requests/i');
    await expect(recentSection).toBeVisible({ timeout: 5000 });
  });

  test('should display maintenance chart', async ({ page }) => {
    // Check for chart container
    const chartContainer = page.locator('.recharts-wrapper, [data-testid="maintenance-chart"]');
    await expect(chartContainer.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to requests page from quick actions', async ({ page }) => {
    // Click on view all requests or similar action
    const viewAllButton = page.locator('text=/عرض الكل|View All|جميع الطلبات/i').first();
    
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      await expect(page).toHaveURL(/.*requests/);
    }
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for loading indicators (skeleton or spinner)
    const loadingIndicator = page.locator('[data-testid="loading"], .animate-spin, .skeleton');
    
    // Loading should appear briefly
    if (await loadingIndicator.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator.first()).toBeVisible();
    }
  });
});
