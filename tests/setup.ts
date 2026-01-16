import { vi } from 'vitest';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});
