import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { login } from './auth';

describe('Auth API Integration', () => {
  it.skip('should return a 401 error when providing invalid credentials', async () => {
    // This is an integration test. It requires the local server to be running.
    const invalidCredentials = {
      email: 'nonexistent-user@example.com',
      password: 'wrong-password',
    };

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