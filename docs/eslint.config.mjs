import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    stylistic: true,
  }),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'antfu/reasonable-newline': 'off',
      'e18e/prefer-nullish-coalescing': 'off',
      'perfectionist/sort-imports': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'ts/ban-ts-comment': 'off',
      'vue/block-order': 'off',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      'markdown/no-empty-links': 'off',
      'markdown/no-missing-atx-heading-space': 'off',
      'no-irregular-whitespace': 'off',
      'style/no-trailing-spaces': 'off',
    },
  },
)
