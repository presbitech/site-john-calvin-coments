// Set up global test configuration
import { vi } from 'vitest';

// Only run this setup when we're in a Vitest environment
// This prevents conflicts with Playwright tests
if (typeof vi !== 'undefined') {
  // Global console mocks to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}
