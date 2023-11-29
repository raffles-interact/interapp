import { UserModel } from '@models/user';
import { describe, expect, test, afterAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';

describe('Unit (user)', () => {
  afterAll(async () => {
    await recreateDB();
  });
});
