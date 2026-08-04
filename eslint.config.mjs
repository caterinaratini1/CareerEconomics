import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * eslint-config-next 16 ships native flat configs, so there is no FlatCompat
 * shim here — routing it through @eslint/eslintrc crashes on the plugin
 * object's circular references.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**'],
  },
  ...coreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          // Content must never be interpolated as raw HTML: career copy is
          // authored in JSON and reviewed in PRs, but this keeps the guarantee
          // structural rather than procedural.
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message:
            'dangerouslySetInnerHTML is not allowed. Render content as text nodes.',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', 'tests/**/*.{ts,tsx}'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
