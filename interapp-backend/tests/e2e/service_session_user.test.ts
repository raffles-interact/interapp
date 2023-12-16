import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';

const API_URL = process.env.API_URL;

describe('API (service session user)', async () => {
  let accessToken: string;

  beforeAll(async () => {
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 2,
        username: 'testuser2',
        email: 'test@example.com',
        password: 'testpasswordhhhjh',
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
    if ('access_token' in response_as_json) {
      accessToken = response_as_json.access_token as string;
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
      if (!user) throw new Error('User not found');
      await appDataSource.manager.insert(UserPermission, {
        user: user,
        username: 'testuser',
        permission_id: 2,
      });
      await appDataSource.manager.insert(UserPermission, {
        user: user,
        username: 'testuser',
        permission_id: 4,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // create 2 services
    await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'L bozo',
        description: 'jfdlkjasl;fkjs',
        contact_email: 'asjlfkjfl@jkljfl.com',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 'testuser',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'LLLLLLLLL bozo',
        description: 'test descriptionfsdkjfdsklfjdsl;f',
        contact_email: 'shutup@gmail.com',
        day_of_week: 5,
        start_time: '11:00',
        end_time: '12:00',
        service_ic_username: 'testuser2',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });

    // create service session
    await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
  });

  test('add user to service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 1,
        username: 'testuser',
        ad_hoc: false,
        attended: 'Attended',
        is_ic: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(201);
  });

  test('delete user from service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_session_id: 1,
        username: 'testuser',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('add multiple users to service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user_bulk`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 1,
        users: [
          {
            username: 'testuser',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: true,
          },
          {
            username: 'testuser2',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: false,
          },
        ],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(201);
  });

  test('get service session users', async () => {
    const res = await fetch(`${API_URL}/service/session_user_bulk?service_session_id=1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject([
      {
        service_session_id: 1,
        username: 'testuser',
        ad_hoc: false,
        attended: 'Attended',
        is_ic: true,
      },
      {
        service_session_id: 1,
        username: 'testuser2',
        ad_hoc: false,
        attended: 'Attended',
        is_ic: false,
      },
    ]);
  });

  test('get individual service session user', async () => {
    const res = await fetch(
      `${API_URL}/service/session_user?service_session_id=1&username=testuser`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 1,
      username: 'testuser',
      ad_hoc: false,
      attended: 'Attended',
      is_ic: true,
    });
  });

  test('update service session user', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_session_id: 1,
        username: 'testuser',
        ad_hoc: false,
        attended: 'Absent',
        is_ic: false,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
  });

  test('delete service session user', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_session_id: 1,
        username: 'testuser',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  afterAll(async () => {
    await recreateDB();
  });
});
