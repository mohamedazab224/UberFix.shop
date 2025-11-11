import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineStorage } from '@/lib/offlineStorage';

describe('OfflineStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve data', () => {
    const testData = { id: 1, name: 'Test' };
    OfflineStorage.set('test-key', testData);
    
    const retrieved = OfflineStorage.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', () => {
    const testData = { id: 1, name: 'Test' };
    OfflineStorage.set('test-key', testData, 0);
    
    const retrieved = OfflineStorage.get('test-key');
    expect(retrieved).toBeNull();
  });

  it('should remove data', () => {
    OfflineStorage.set('test-key', { id: 1 });
    OfflineStorage.remove('test-key');
    
    expect(OfflineStorage.has('test-key')).toBe(false);
  });

  it('should clear all cached data', () => {
    OfflineStorage.set('key1', { id: 1 });
    OfflineStorage.set('key2', { id: 2 });
    
    OfflineStorage.clear();
    
    expect(OfflineStorage.has('key1')).toBe(false);
    expect(OfflineStorage.has('key2')).toBe(false);
  });
});
