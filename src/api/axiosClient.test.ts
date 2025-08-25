import { describe, it, expect } from 'vitest';
import axiosClient from './axiosClient';

describe('axiosClient', () => {
  it('has the expected defaults', () => {
    // @ts-expect-error Testing internal axios defaults intentionally
    expect(axiosClient.defaults.baseURL).toBe('/api');
    // @ts-expect-error Testing internal axios defaults intentionally
    expect(axiosClient.defaults.withCredentials).toBe(true);
    // @ts-expect-error Testing internal axios defaults intentionally
    expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
