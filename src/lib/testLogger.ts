import { supabase } from '@/integrations/supabase/client';

export interface TestLog {
  test_name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  timestamp: string;
  error_details?: any;
  stack_trace?: string;
  metadata?: Record<string, any>;
}

class TestLogger {
  private logs: TestLog[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  log(log: Omit<TestLog, 'timestamp'>): void {
    const fullLog: TestLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(fullLog);
    
    // تسجيل في console للمراجعة الفورية
    const color = log.status === 'success' ? 'green' : log.status === 'error' ? 'red' : 'orange';
    console.log(
      `%c[TEST ${log.status.toUpperCase()}] ${log.test_name}`,
      `color: ${color}; font-weight: bold`,
      log.message,
      log.error_details || ''
    );

    // تسجيل في localStorage للحفظ المؤقت
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      const testHistory = this.getTestHistory();
      testHistory.push({
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        logs: this.logs,
      });

      // الاحتفاظ بآخر 10 جلسات فقط
      const trimmedHistory = testHistory.slice(-10);
      localStorage.setItem('test_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save test logs to localStorage:', error);
    }
  }

  getTestHistory(): Array<{ sessionId: string; timestamp: string; logs: TestLog[] }> {
    try {
      const history = localStorage.getItem('test_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  async saveToDatabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const testResults = {
        session_id: this.sessionId,
        user_id: user?.id,
        total_tests: this.logs.length,
        passed: this.logs.filter(l => l.status === 'success').length,
        failed: this.logs.filter(l => l.status === 'error').length,
        warnings: this.logs.filter(l => l.status === 'warning').length,
        logs: this.logs,
        created_at: new Date().toISOString(),
      };

      // حفظ في localStorage كنسخة احتياطية
      localStorage.setItem(`test_session_${this.sessionId}`, JSON.stringify(testResults));

      console.log('Test results saved:', testResults);
    } catch (error) {
      console.error('Failed to save test results to database:', error);
    }
  }

  getSummary() {
    const total = this.logs.length;
    const success = this.logs.filter(l => l.status === 'success').length;
    const error = this.logs.filter(l => l.status === 'error').length;
    const warning = this.logs.filter(l => l.status === 'warning').length;
    const avgDuration = this.logs.reduce((sum, l) => sum + (l.duration || 0), 0) / total;

    return {
      total,
      success,
      error,
      warning,
      successRate: total > 0 ? ((success / total) * 100).toFixed(2) : '0',
      avgDuration: avgDuration.toFixed(2),
      failedTests: this.logs.filter(l => l.status === 'error').map(l => l.test_name),
    };
  }

  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      logs: this.logs,
    }, null, 2);
  }

  clear(): void {
    this.logs = [];
    this.sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getLogs(): TestLog[] {
    return [...this.logs];
  }
}

export const testLogger = new TestLogger();
