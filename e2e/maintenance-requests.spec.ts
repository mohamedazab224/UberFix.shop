import { test, expect } from '@playwright/test';
import { testUsers, testRequest } from './fixtures/test-data';

/**
 * E2E Tests: Maintenance Requests Journey
 * اختبارات رحلة إنشاء وإدارة طلبات الصيانة
 */
test.describe('Maintenance Requests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to requests page
    await page.goto('/requests');
  });

  test('should display requests list', async ({ page }) => {
    await expect(page.locator('text=/طلبات الصيانة|Maintenance Requests/i')).toBeVisible();
    
    // Check for list container or table
    const listContainer = page.locator('[data-testid="requests-list"], .requests-list, table');
    await expect(listContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open create request dialog', async ({ page }) => {
    // Click create new request button
    const createButton = page.locator('text=/طلب جديد|New Request|إضافة طلب/i').first();
    await createButton.click();
    
    // Check for dialog/modal
    const dialog = page.locator('[role="dialog"], .dialog, [data-testid="create-request-dialog"]');
    await expect(dialog.first()).toBeVisible();
  });

  test('should create a new maintenance request', async ({ page }) => {
    // Click create button
    await page.locator('text=/طلب جديد|New Request|إضافة طلب/i').first().click();
    
    // Fill form
    await page.fill('[name="title"], input[placeholder*="عنوان"]', testRequest.title);
    await page.fill('[name="description"], textarea[placeholder*="وصف"]', testRequest.description);
    
    // Select priority if available
    const prioritySelect = page.locator('[name="priority"], select[aria-label*="أولوية"]');
    if (await prioritySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prioritySelect.selectOption(testRequest.priority);
    }
    
    // Submit form
    await page.locator('button[type="submit"], button:has-text("حفظ"), button:has-text("Save")').click();
    
    // Verify success
    await expect(page.locator('text=/تم إنشاء|نجح|Success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should filter requests by status', async ({ page }) => {
    // Click on filter/tabs
    const filterButton = page.locator('text=/قيد الانتظار|Pending/i').first();
    
    if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filterButton.click();
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Verify URL or UI update
      expect(page.url()).toContain('status=pending');
    }
  });

  test('should search for requests', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]');
    
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Results should update
      await expect(page.locator('[data-testid="requests-list"]')).toBeVisible();
    }
  });

  test('should navigate between pages with pagination', async ({ page }) => {
    // Check if pagination exists
    const nextButton = page.locator('button[aria-label*="Next"], button:has-text("التالي")');
    
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isEnabled = await nextButton.isEnabled();
      
      if (isEnabled) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Verify page changed
        expect(page.url()).toContain('page=2');
      }
    }
  });
});
