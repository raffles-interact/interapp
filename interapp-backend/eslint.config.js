import 'eslint-plugin-only-warn';
import * as eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(...tseslint.configs.recommended, {
  ignores: ['node_modules/', 'pgdata/', 'minio-data/', 'tests/', 'scripts/'],
});
