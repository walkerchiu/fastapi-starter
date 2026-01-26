import baseConfig from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/.venv/',
      '**/__pycache__/',
      '**/.next/',
      '**/out/',
      '**/next-env.d.ts',
    ],
  },
];
