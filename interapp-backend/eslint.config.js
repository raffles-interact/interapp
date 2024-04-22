import 'eslint-plugin-only-warn';
import * as eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ['node_modules/', 'pgdata/', 'minio-data/', 'tests/', 'scripts/'],
});
