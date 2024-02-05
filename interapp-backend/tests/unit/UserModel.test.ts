import { testSuites } from '../constants.test';
import { AuthModel, ServiceModel } from '../../api/models';
import { describe, test, expect } from 'bun:test';
import { recreateDB, recreateRedis } from '../utils';
import redisClient from '@utils/init_redis';
import { AttendanceStatus } from '@db/entities/service_session_user';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

const suite = testSuites.UserModel;

const signUp = async (id: number, username: string) =>
  AuthModel.signUp(id, username, 'jdefjdkf@jfkfj.com', 'pass');

suite.getUser = [];

console.log(suite);
describe('UserModel', () => {
  for (const [method, tests] of Object.entries(suite)) {
    describe(method, async () => {
      for (const { name, cb, cleanup } of tests) {
        test(name, async () => {
          try {
            await cb();
          } finally {
            if (cleanup) await cleanup();
          }
        });
      }
    });
  }
  test.todo('make sure suite is exhaustive', () => {
    Object.values(suite).forEach((tests) => {
      expect(tests).toBeArray();
      expect(tests).not.toBeEmpty();
    });
  });
});
