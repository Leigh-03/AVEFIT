import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/.astro/**',
      '**/assets/**',
      '**/dist/**',
      '**/node_modules/**',
      'apps/site/public/frames/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
