/**
 * Test data for E2E tests
 * بيانات الاختبار للـ E2E tests
 */

export const testUsers = {
  admin: {
    email: 'admin@uberfix.shop',
    password: 'Admin@123',
    role: 'admin',
  },
  vendor: {
    email: 'vendor@uberfix.shop',
    password: 'Vendor@123',
    role: 'vendor',
  },
  customer: {
    email: 'customer@uberfix.shop',
    password: 'Customer@123',
    role: 'customer',
  },
};

export const testRequest = {
  title: 'Test Maintenance Request',
  description: 'This is a test maintenance request for E2E testing',
  priority: 'high',
  category: 'plumbing',
};

export const testProperty = {
  name: 'Test Building A',
  address: '123 Test Street, Cairo, Egypt',
  type: 'commercial',
};
