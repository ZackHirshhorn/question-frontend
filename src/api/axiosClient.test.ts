import { describe, it, expect } from 'vitest';
import axiosClient from './axiosClient';

describe('axiosClient', () => {
  it('has the expected defaults', () => {
    expect(axiosClient.defaults.baseURL).toBe('/api');
    expect(axiosClient.defaults.withCredentials).toBe(true);
    expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
