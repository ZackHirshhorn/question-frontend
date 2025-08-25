import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ensure no DOM leaks between tests, especially when running the full suite.
afterEach(() => {
  cleanup();
});
