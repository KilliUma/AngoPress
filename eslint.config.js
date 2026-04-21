// @ts-check
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.turbo/**', '**/coverage/**', '**/build/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
]
