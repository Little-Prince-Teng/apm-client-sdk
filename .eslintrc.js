module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  overrides: [
    {
      files: ['*.config.ts', '*.config.js', '.eslintrc.js'],
      parserOptions: {
        project: null
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off'
      }
    }
  ],
  rules: {
    'prettier/prettier': 'error',
    
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-magic-numbers': ['warn', {
      ignore: [-1, 0, 1, 2, 60000],
      ignoreArrayIndexes: true
    }],
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'semi': 'off',
    '@typescript-eslint/semi': 'off'
  }
};
