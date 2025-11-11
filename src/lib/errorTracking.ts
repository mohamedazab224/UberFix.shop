import { supabase } from '@/integrations/supabase/client';

interface ErrorTrackingData {
  message: string;
  stack?: string;
  level?: 'error' | 'warning' | 'info';
  metadata?: Record<string, any>;
}

interface ErrorQueueItem extends ErrorTrackingData {
  url: string;
  user_agent: string;
  timestamp: string;
}

class ErrorTracker {
  private isEnabled = import.meta.env.PROD;
  private queue: ErrorQueueItem[] = [];
  private isFlushingQueue = false;
  private maxQueueSize = 50;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    // Auto-flush queue periodically
    if (this.isEnabled && typeof window !== 'undefined') {
      setInterval(() => this.flushQueue(), this.flushInterval);
      
      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flushQueue());
    }
  }

  async track(error: Error | string, data?: Partial<ErrorTrackingData>) {
    const errorData: ErrorQueueItem = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      level: data?.level || 'error',
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      metadata: {
        ...data?.metadata,
        pathname: window.location.pathname,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      }
    };

    // تسجيل في console دائماً في التطوير
    if (!import.meta.env.PROD) {
      console.error('Error tracked:', errorData);
      return; // Don't send in development
    }

    // Add to queue
    this.queue.push(errorData);

    // Flush if queue is full or error is critical
    if (this.queue.length >= this.maxQueueSize || data?.level === 'error') {
      await this.flushQueue();
    }
  }

  private async flushQueue() {
    if (this.isFlushingQueue || this.queue.length === 0) return;
    
    this.isFlushingQueue = true;
    const errorsToSend = [...this.queue];
    this.queue = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No active session, errors will be queued');
        this.queue.unshift(...errorsToSend);
        return;
      }

      const { data, error } = await supabase.functions.invoke('error-tracking', {
        body: errorsToSend
      });

      if (error) {
        console.error('Failed to send errors:', error);
        // Re-queue on failure (up to max size)
        this.queue.unshift(...errorsToSend.slice(0, this.maxQueueSize - this.queue.length));
      } else {
        console.log(`Successfully sent ${errorsToSend.length} errors to server`, data);
      }
    } catch (err) {
      console.error('Error flushing queue:', err);
      // Re-queue on network failure
      this.queue.unshift(...errorsToSend.slice(0, this.maxQueueSize - this.queue.length));
    } finally {
      this.isFlushingQueue = false;
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
  }

  trackApiError(error: any, endpoint: string, method: string) {
    this.track(error, {
      level: 'error',
      metadata: {
        type: 'api_error',
        endpoint,
        method,
        status: error?.status,
        statusText: error?.statusText
      }
    });
  }

  trackUserAction(action: string, metadata?: Record<string, any>) {
    this.track(`User action: ${action}`, {
      level: 'info',
      metadata: {
        type: 'user_action',
        action,
        ...metadata
      }
    });
  }

  trackPerformance(metric: string, value: number, metadata?: Record<string, any>) {
    this.track(`Performance: ${metric}`, {
      level: 'info',
      metadata: {
        type: 'performance',
        metric,
        value,
        ...metadata
      }
    });
  }
}

export const errorTracker = new ErrorTracker();

// إعداد تتبع الأخطاء العامة
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    errorTracker.track(event.error || event.message, {
      level: 'error',
      metadata: { type: 'global_error' }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.track(event.reason, {
      level: 'error',
      metadata: { type: 'unhandled_rejection' }
    });
  });
}
