import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  stylistic: true,
  rules: {
    'antfu/reasonable-newline': 'off',
    'e18e/prefer-nullish-coalescing': 'off',
    'perfectionist/sort-imports': 'off',
    'pnpm/json-enforce-catalog': 'off',
    'unused-imports/no-unused-vars': ['error', {
      varsIgnorePattern: 'slots|emits',
    }],
  },
})
