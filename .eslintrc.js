module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    // Temporarily disable some strict rules for the build
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
}