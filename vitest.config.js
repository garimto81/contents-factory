// Vitest Configuration for Photo Factory
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'happy-dom', // Fast DOM implementation

    // Global setup
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '*.config.js',
        '*.config.cjs',
        'src/public/**/*.html'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },

    // Test files
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'tests/e2e'],

    // Setup files
    setupFiles: ['./tests/setup.js'],

    // Timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode
    watch: false,

    // Reporter
    reporter: ['default', 'html'],
  },

  // Resolve aliases (same as vite.config.js)
  resolve: {
    alias: {
      '@': '/src',
      '@js': '/src/js',
      '@public': '/src/public'
    }
  },

  // Environment variables for tests
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://test.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify('test-cloud'),
    'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify('test-preset'),
  }
});
