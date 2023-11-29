import { AuthModel } from '@models/auth';
import { describe, expect, test, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User } from '@db/entities/user';

describe('Unit (auth)', () => {
  describe('Unit (signup/signin)', () => {
    test('create accounts', async () => {
      await recreateDB();
      await AuthModel.signUp(1, 'unit test user', 'dskjfklsjf@jfndcdfs', 'testpassword');
      await AuthModel.signUp(2, 'unit test user2', 'dskjfklsjf@jfndcdfs', 'testpassword');

      const res = await appDataSource.manager
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.username = :username', { username: 'unit test user' })
        .getOne();
      expect(res).toBeDefined();

      const res2 = await appDataSource.manager
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.username = :username', { username: 'unit test user2' })
        .getOne();
      expect(res2).toBeDefined();
    });

    test('create duplicate account', async () => {
      expect(
        async () =>
          await AuthModel.signUp(1, 'unit test user', 'dskjfklsjf@jfndcdfs', 'testpassword'),
      ).toThrow('The user with username unit test user already exists in the database');
    });
    test('sign in', async () => {
      const res = await AuthModel.signIn('unit test user', 'testpassword');
      expect(res).toMatchObject({
        token: expect.any(String),
        refresh: expect.any(String),
        expire: expect.any(Number),
        user: {
          user_id: 1,
          username: 'unit test user',
          email: 'dskjfklsjf@jfndcdfs',
          verified: false,
          serviceHours: 0,
          permissions: expect.any(Array<Number>),
        },
      });
    });

    test('sign in with wrong password', async () => {
      expect(async () => await AuthModel.signIn('unit test user', 'testpassword2')).toThrow(
        'The password you entered is incorrect',
      );
    });

    test('sign in with wrong username', async () => {
      expect(async () => await AuthModel.signIn('unit test user9', 'testpassword')).toThrow(
        'The user with username unit test user9 was not found in the database',
      );
    });

    afterAll(async () => {
      await recreateDB();
    });
  });

  describe('Unit (tokens)', () => {
    let tokens: { token: string; refresh: string; expire: number };
    let newtokens: { token: string; refresh: string; expire: number };
    beforeAll(async () => {
      await AuthModel.signUp(1, 'unit test user', 'dskjfklsjf@jfndcdfs', 'testpassword');
      tokens = await AuthModel.signIn('unit test user', 'testpassword');
      newtokens = await AuthModel.getNewAccessToken(tokens.refresh);
    });

    test('refresh token', async () => {
      expect(tokens).not.toEqual(newtokens);
      tokens = newtokens;
    });

    test('refresh token with wrong refresh token', async () => {
      expect(async () => await AuthModel.getNewAccessToken('wrongtoken')).toThrow(
        'The JWT you provided is invalid',
      );
    });

    test('verify token', async () => {
      const res = await AuthModel.verify(tokens.token);
      expect(res.payload).toMatchObject({
        user_id: 1,
        username: 'unit test user',
      });
    });

    test('sign out', async () => {
      const res = await AuthModel.signOut('unit test user', tokens.token);
      expect(res).toBe(undefined);
    });

    test('verify token after sign out', async () => {
      expect(async () => await AuthModel.verify(tokens.token)).toThrow(
        'The JWT you provided is invalid',
      );
    });

    afterAll(async () => {
      await recreateDB();
    });
  });
});
