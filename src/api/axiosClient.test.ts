import { describe, it, expect } from 'vitest';
import axiosClient from './axiosClient';

describe('axiosClient', () => {
  it('has the expected defaults', () => {
    // @ts-expect-error access private defaults for test
    expect(axiosClient.defaults.baseURL).toBe('/api');
    // @ts-expect-error
    expect(axiosClient.defaults.withCredentials).toBe(true);
    // @ts-expect-error
    expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});

