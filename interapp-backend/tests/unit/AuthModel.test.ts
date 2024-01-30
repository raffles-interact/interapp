import { testSuites } from '../constants.test';
import { AuthModel, ServiceModel, UserModel } from '../../api/models';
import { User } from '@db/entities';
import { describe, test, expect } from 'bun:test';
import { recreateDB, recreateRedis } from '../utils';
import redisClient from '@utils/init_redis';
import { AttendanceStatus } from '@db/entities/service_session_user';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

const suite = testSuites.AuthModel;

const signUpUser = async (id: number, name: string) =>
  await AuthModel.signUp(id, name, 'sfsajhjkh@fdjfas', 'pass');

// these are private internal methods
delete suite.signJWT;
delete suite.accessSecret;
delete suite.refreshSecret;

suite.signUp = [
  {
    name: 'should sign up user',
    cb: async () => {
      await signUpUser(1, 'joe');
      const user = (await UserModel.getUserDetails('joe')) as Omit<
        User,
        | 'password_hash'
        | 'refresh_token'
        | 'user_permissions'
        | 'user_services'
        | 'service_session_users'
      >;
      expect(user).toBeObject();
      expect(user.user_id).toBe(1);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should throw duplicate error',
    cb: async () => {
      await signUpUser(1, 'joe');
      expect(signUpUser(1, 'joe')).rejects.toThrow(
        'The user with username joe already exists in the database',
      );
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should disallow empty password',
    cb: async () => {
      expect(AuthModel.signUp(1, 'joe', '@@@', '')).rejects.toThrow();
    },
  },
];

suite.signIn = [
  {
    name: 'should sign in',
    cb: async () => {
      await signUpUser(1, 'test');
      const res = await AuthModel.signIn('test', 'pass');

      expect(new Date().valueOf()).toBeLessThan(res.expire);
      expect(res).toMatchObject({
        token: expect.any(String),
        refresh: expect.any(String),
        expire: expect.any(Number),
        user: {
          user_id: 1,
          username: 'test',
          email: 'sfsajhjkh@fdjfas',
          verified: false,
          service_hours: 0,
          permissions: expect.any(Array),
        },
      });
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should reject wrong password',
    cb: async () => {
      await signUpUser(1, 'test');
      expect(AuthModel.signIn('test', 'testpassword2')).rejects.toThrow(
        'The password you entered is incorrect',
      );
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should reject wrong username',
    cb: async () => {
      expect(AuthModel.signIn('unit test user9', 'testpassword')).rejects.toThrow(
        'The user with username unit test user9 was not found in the database',
      );
    },
  },
];

suite.signOut = [
  {
    name: 'should sign out',
    cb: async () => {
      await signUpUser(1, 'test');
      const { token } = await AuthModel.signIn('test', 'pass');
      expect(AuthModel.signOut('test', token)).resolves.toBeUndefined();
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
];

suite.getNewAccessToken = [
  {
    name: 'should get new access token',
    cb: async () => {
      await signUpUser(1, 'test');
      const { token, refresh } = await AuthModel.signIn('test', 'pass');

      const newToken = await AuthModel.getNewAccessToken(refresh);

      expect(newToken.token).toBeString();
      expect(newToken.token).not.toEqual(token);
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should not get invalid access token',
    cb: async () => {
      expect(AuthModel.getNewAccessToken('wrongtoken')).rejects.toThrow(
        'The JWT you provided is invalid',
      );
    },
  },
];

suite.verify = [
  {
    name: 'should verify token',
    cb: async () => {
      await signUpUser(1, 'test');
      const { token } = await AuthModel.signIn('test', 'pass');
      const res = await AuthModel.verify(token);
      expect(res.payload).toMatchObject({
        user_id: 1,
        username: 'test',
      });
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should not verify blacklisted token',
    cb: async () => {
      await signUpUser(1, 'test');
      const { token } = await AuthModel.signIn('test', 'pass');
      expect(AuthModel.signOut('test', token)).resolves.toBeUndefined();
      expect(AuthModel.getNewAccessToken(token)).rejects.toThrow('The JWT you provided is invalid');
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
];

describe('AuthModel', () => {
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
  test('make sure suite is exhaustive', () => {
    Object.values(suite).forEach((tests) => {
      expect(tests).toBeArray();
      expect(tests).not.toBeEmpty();
    });
  });
});
