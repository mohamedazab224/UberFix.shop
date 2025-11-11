# E2E Testing Documentation
# دليل اختبارات E2E

## 📖 Overview / نظرة عامة

This directory contains End-to-End (E2E) tests using Playwright to ensure the quality and reliability of the UberFix application in production.

يحتوي هذا المجلد على اختبارات E2E باستخدام Playwright لضمان جودة وموثوقية تطبيق UberFix في الإنتاج.

## 🚀 Getting Started / البدء

### Install Dependencies / تثبيت التبعيات

```bash
pnpm install
pnpm exec playwright install
```

### Run Tests / تشغيل الاختبارات

```bash
# Run all tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test e2e/auth.spec.ts

# Run in headed mode (see browser)
pnpm exec playwright test --headed

# Run in debug mode
pnpm exec playwright test --debug

# Run on specific browser
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit

# Run mobile tests
pnpm exec playwright test --project="Mobile Chrome"
```

### View Test Report / عرض تقرير الاختبارات

```bash
pnpm exec playwright show-report
```

## 📁 Test Structure / هيكل الاختبارات

```
e2e/
├── fixtures/
│   └── test-data.ts          # Test data and user credentials
├── utils/
│   └── auth.setup.ts         # Authentication setup
├── auth.spec.ts              # Login/logout journey tests
├── dashboard.spec.ts         # Dashboard functionality tests
├── maintenance-requests.spec.ts  # Requests CRUD tests
├── navigation.spec.ts        # Navigation and routing tests
├── responsive.spec.ts        # Responsive design tests
└── README.md
```

## 🧪 Test Coverage / تغطية الاختبارات

### ✅ Authentication Tests
- Login with valid/invalid credentials
- Forgot password flow
- Logout functionality
- Session persistence

### ✅ Dashboard Tests
- Statistics display
- Recent requests loading
- Chart rendering
- Quick actions navigation

### ✅ Maintenance Requests Tests
- View requests list
- Create new request
- Filter by status
- Search functionality
- Pagination

### ✅ Navigation Tests
- Sidebar menu navigation
- Browser back/forward buttons
- Mobile menu toggle
- State persistence after reload

### ✅ Responsive Tests
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## 🔧 Configuration / التكوين

### Environment Variables

Create a `.env.test` file for test-specific configuration:

```env
PLAYWRIGHT_BASE_URL=http://localhost:8080
TEST_USER_EMAIL=admin@uberfix.shop
TEST_USER_PASSWORD=Admin@123
```

### Test Users

Default test users are defined in `fixtures/test-data.ts`:

- **Admin**: admin@uberfix.shop / Admin@123
- **Vendor**: vendor@uberfix.shop / Vendor@123
- **Customer**: customer@uberfix.shop / Customer@123

## 📊 CI/CD Integration

E2E tests run automatically on:
- Every push to `main` or `develop` branches
- Pull requests
- Daily at 2 AM UTC (scheduled)

Tests run on multiple browsers:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

## 🐛 Debugging / تصحيح الأخطاء

### Debug Failed Tests

```bash
# Run with UI mode
pnpm exec playwright test --ui

# Run with trace viewer
pnpm exec playwright test --trace on
pnpm exec playwright show-trace trace.zip
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Traces (in `test-results/`)

## 📝 Writing New Tests / كتابة اختبارات جديدة

### Example Test Template

```typescript
import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login, navigate, etc.
    await page.goto('/login');
    // ... login steps
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/feature');
    
    // Act
    await page.click('button#action');
    
    // Assert
    await expect(page.locator('#result')).toBeVisible();
  });
});
```

## 🎯 Best Practices / أفضل الممارسات

1. **Use data-testid attributes** for stable selectors
2. **Avoid hard-coded waits** - use `waitForSelector` or `waitForURL`
3. **Test user journeys**, not implementation details
4. **Keep tests independent** - each test should run in isolation
5. **Use meaningful test names** that describe the user behavior
6. **Clean up test data** after each test
7. **Use Page Object Model** for complex pages
8. **Run tests in parallel** when possible

## 📚 Resources / مصادر

- [Playwright Documentation](https://playwright.dev/)
- [Best Testing Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## 🤝 Contributing / المساهمة

When adding new features:
1. Write E2E tests for critical user journeys
2. Run tests locally before pushing
3. Update this README if adding new test categories
4. Ensure tests pass in CI before merging

---

**Note**: E2E tests require the application to be running. The test configuration automatically starts the dev server before running tests.

**ملاحظة**: تتطلب اختبارات E2E تشغيل التطبيق. يقوم تكوين الاختبار تلقائياً بتشغيل خادم التطوير قبل تشغيل الاختبارات.
