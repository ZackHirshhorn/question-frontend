import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { login } from './auth';
import axiosClient from './axiosClient';

describe('Auth API Integration', () => {
  it('should return a 401 error when providing invalid credentials', async () => {
    const invalidCredentials = {
      email: 'nonexistent-user@example.com',
      password: 'wrong-password',
    };

    // Mock axiosClient.post to reject with a 401-like AxiosError
    vi.spyOn(axiosClient, 'post').mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { message: 'Unauthorized' } },
    } as unknown);

    try {
      await login(invalidCredentials);
      // If the above line does not throw, it means the login succeeded, which is an error for this test.
      throw new Error('Login succeeded unexpectedly for invalid credentials.');
    } catch (error) {
      // We expect an Axios error.
      if (axios.isAxiosError(error)) {
        // Assert that the response status is either 400 or 401.
        expect([400, 401]).toContain(error.response?.status);
      } else {
        // If it's not an Axios error, something else went wrong.
        throw error;
      }
    }
  });
});
