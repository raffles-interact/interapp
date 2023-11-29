import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from './utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';

const API_URL = process.env.API_URL;

describe('test announcement endpoints', () => {
  let accessToken: string;
  beforeAll(async () => {
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 1,
        username: 'testuser',
        email: 'aspoda@gmail.com',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 2,
        username: 'testuser2',
        email: 'fkfdjs@fmk.com',
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
        permission_id: 4,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  });

  // Test for POST endpoint
  test('create announcement', async () => {
    const res = await fetch(`${API_URL}/announcement/`, {
      method: 'POST',
      body: JSON.stringify({
        creation_date: '2022-01-01T00:00Z',
        title: 'Test Title',
        description: 'Test Description',
        username: 'testuser',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(201);
  });

  // Test for adding users to announcement
  test('add users to announcement', async () => {
    const res = await fetch(`${API_URL}/announcement/completions`, {
      method: 'POST',
      body: JSON.stringify({
        announcement_id: 1,
        usernames: ['testuser', 'testuser2'],
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(201);
  });

  // Test for getting users announcement completion status
  test('get users announcement completion status', async () => {
    const res = await fetch(`${API_URL}/announcement/completions?announcement_id=1`, {
      method: 'GET',
      
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      testuser: false,
      testuser2: false,
    })
  });

  // Test for updating users announcement completion status
  test('update users announcement completion status', async () => {
    const res = await fetch(`${API_URL}/announcement/completion`, {
      method: 'PATCH',
      body: JSON.stringify({
        announcement_id: 1,
        username: 'testuser',
        completed: true,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  // check if user has completed announcement
  test('check if user has completed announcement', async () => {
    const res = await fetch(`${API_URL}/announcement/completions?announcement_id=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      testuser: true,
      testuser2: false,
    })
  });

  // Test for invalid POST endpoint
  test('create announcement with invalid date', async () => {
    const res = await fetch(`${API_URL}/announcement/`, {
      method: 'POST',
      body: JSON.stringify({
        creation_date: '2022-01-01',
        title: 'Test Title',
        description: 'Test Description',
        username: 'testuser',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(400);
  });

  // Test for GET endpoint
  test('get announcement', async () => {
    const res = await fetch(`${API_URL}/announcement/?announcement_id=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
  });

  // Test for GET /all endpoint
  test('get all announcements', async () => {
    const res = await fetch(`${API_URL}/announcement/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
  });

  // Test for PATCH endpoint
  test('update announcement', async () => {
    const res = await fetch(`${API_URL}/announcement`, {
      method: 'PATCH',
      body: JSON.stringify({
        announcement_id: 1,
        title: 'Updated Title',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
  });

  // Test for DELETE endpoint
  test('delete announcement', async () => {
    const res = await fetch(`${API_URL}/announcement`, {
      method: 'DELETE',
      body: JSON.stringify({
        announcement_id: 1,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  afterAll(async () => {
    await recreateDB();
  });
});
