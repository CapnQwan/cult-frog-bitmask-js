import { baseVitestConfig } from '@cult-frog/tooling/vitest/base';

export default baseVitestConfig({
  aliasName: '@cult-frog/bitmask',
  testOverrides: {
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
  },
});
