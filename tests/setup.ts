/**
 * Jest setup file for BitCell tests
 */

// Set test environment variables
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true
});
process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://api.devnet.solana.com';
process.env.NEXT_PUBLIC_BITCELL_PROGRAM_ID = '11111111111111111111111111111111';

// Global test configuration
jest.setTimeout(30000);

// Mock external dependencies as needed
global.console = {
  ...console,
  // Uncomment to hide console.log during tests
  // log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add custom matchers if needed
expect.extend({
  toBeValidSolanaSignature(received: string) {
    const pass = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Solana signature`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Solana signature`,
        pass: false,
      };
    }
  },
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidSolanaSignature(): R;
    }
  }
}

export {};
