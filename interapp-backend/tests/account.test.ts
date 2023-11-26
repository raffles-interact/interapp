import { test, expect, describe, afterAll, beforeAll, beforeEach } from 'bun:test';
import { recreateDB } from './utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';

const API_URL = process.env.API_URL;

describe('change account details', async () => {
  let accessToken: string;

  beforeAll(async () => {
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response_as_json = (await res.json()) as Object;
    if ('accessToken' in response_as_json) {
      accessToken = response_as_json.accessToken as string;
    } else throw new Error('No access token found');
  });

  test('change password', async () => {
    const res = await fetch(`${API_URL}/user/password/change`, {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'testpassword',
        newPassword: 'newpassword',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('attempt to bypass role restrictions', async () => {
    // testuser should not have admin permissions
    const res = await fetch(`${API_URL}/user/permissions/update`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser',
        permissions: [0, 6],
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(403);
  });

  test('give self perms', async () => {
    const queryRunner = appDataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();
      const user = await appDataSource.manager
        .createQueryBuilder()
        .select(['user'])
        .from(User, 'user')
        .leftJoinAndSelect('user.user_permissions', 'user_permissions')
        .where('user.username = :username', { username: 'testuser' })
        .getOne();
      await appDataSource.manager.insert(UserPermission, {
        user: user!,
        username: 'testuser',
        permission_id: 6,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    const res = await fetch(`${API_URL}/user/permissions/update`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser',
        permissions: [0, 6],
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);

    const perms = await appDataSource.manager
      .createQueryBuilder()
      .select(['user_permissions'])
      .from(UserPermission, 'user_permissions')
      .where('user_permissions.username = :username', { username: 'testuser' })
      .getMany();
  });

  //test logout
  test('logout', async () => {
    const res = await fetch(`${API_URL}/auth/signout`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('login with new password', async () => {
    // try with old password
    const old = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(old.status).toBe(401);

    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'newpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);

    const response_as_json = (await res.json()) as Object;
    expect(response_as_json).toMatchObject({
      accessToken: expect.any(String),
      user: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        verified: false,
        serviceHours: 0,
        permissions: [0, 6],
      },
      expire: expect.any(Number),
    });
  });

  afterAll(async () => {
    await recreateDB();
  });
});
