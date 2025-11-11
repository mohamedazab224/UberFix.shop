import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useErrorHandler', () => {
  it('should handle successful async operations', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const testFn = async () => 'success';
    const response = await result.current.handleAsync(testFn);
    
    expect(response).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('should handle errors in async operations', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const testFn = async () => {
      throw new Error('Test error');
    };
    
    const response = await result.current.handleAsync(testFn);
    
    expect(response).toBeNull();
    expect(result.current.error).toBe('Test error');
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    result.current.clearError();
    
    expect(result.current.error).toBeNull();
  });
});
