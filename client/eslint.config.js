import tseslint from 'typescript-eslint';

/**
 * Frontend networking architecture enforcement
 *
 * Goal: In service-layer code, `envelopedFetch` is the ONLY allowed HTTP pattern.
 * Scope is intentionally narrow to avoid impacting app/UI code and tests.
 */
export default [
  // Keep ESLint intentionally minimal: ONLY enforce the HTTP architecture bans below.
  // We do NOT enable generic recommended rules to avoid introducing unrelated lint failures.
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.next/**',
      '.turbo/**',
    ],
  },

  // Architecture enforcement (ONLY service layer folders)
  {
    files: [
      'src/services/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/api/**/*.{ts,tsx}',
    ],
    ignores: [
      // Wrapper implementation is the only place `fetch()` is allowed.
      'src/services/http/envelopedFetch.ts',
      // Legacy monolith pending full migration to envelopedFetch.
      // (Kept out of enforcement to avoid blocking the build; see docs/http-contract.md)
      'src/services/api/gerente.api.ts',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      /**
       * Disallow direct fetch usage.
       */
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="fetch"]',
          message:
            'Direct fetch() is forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
        },
        {
          selector:
            'CallExpression[callee.type="MemberExpression"][callee.property.name="json"]',
          message:
            'response.json() is forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
        },
        {
          selector: 'MemberExpression[object.name="apiService"]',
          message:
            'apiService.* is forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
        },
      ],

      /**
       * Disallow other HTTP clients. (Add new clients here if introduced.)
       */
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message:
                'axios is forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
            },
            {
              name: 'ky',
              message:
                'HTTP clients are forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
            },
            {
              name: 'got',
              message:
                'HTTP clients are forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
            },
            {
              name: 'superagent',
              message:
                'HTTP clients are forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
            },
          ],
          patterns: [
            {
              group: ['**/api.service', '**/api.service.ts'],
              message:
                'Legacy apiService import is forbidden in services/hooks/api. Use envelopedFetch<T>() only.',
            },
          ],
        },
      ],
    },
  },

  // Tests are intentionally NOT in scope for enforcement.
];

