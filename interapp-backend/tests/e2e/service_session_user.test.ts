import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';
import { TestErrors } from '@utils/errors';

const API_URL = process.env.API_URL;

describe('API (service session user)', async () => {
  let accessToken: string;
  let accessToken2: string;

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
    } else throw TestErrors.NO_ACCESS_TOKEN;

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

    const res2 = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser2',
        password: 'testpasswordhhhjh',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response_as_json2 = (await res2.json()) as Object;
    if ('access_token' in response_as_json2) {
      accessToken2 = response_as_json2.access_token as string;
    } else throw TestErrors.NO_ACCESS_TOKEN;

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
      if (!user) throw TestErrors.USER_NOT_FOUND;
      await appDataSource.manager.insert(UserPermission, {
        user: user,
        username: 'testuser',
        permission_id: 1,
      });
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

      const user2 = await appDataSource.manager
        .createQueryBuilder()
        .select(['user'])
        .from(User, 'user')
        .leftJoinAndSelect('user.user_permissions', 'user_permissions')
        .where('user.username = :username', { username: 'testuser2' })
        .getOne();
      if (!user2) throw TestErrors.USER_NOT_FOUND;
      await appDataSource.manager.insert(UserPermission, {
        user: user2,
        username: 'testuser2',
        permission_id: 1,
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
        service_hours: 1,
        enable_scheduled: true,
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
        service_hours: 1,
        enable_scheduled: true,
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
        service_hours: 1,
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

  test('get service session users by service session id', async () => {
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

  test('get service session users by username', async () => {
    const res = await fetch(`${API_URL}/service/session_user_bulk?username=testuser`, {
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
        service_id: 1,
        start_time: '2023-11-27T16:42:00.000Z',
        end_time: '2023-11-27T17:42:00.000Z',
        name: 'L bozo',
        promotional_image: null,
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

  test('mark service session user as valid reason', async () => {
    const res = await fetch(`${API_URL}/service/absence`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_session_id: 1,
        username: 'testuser',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    console.log(await res.json());
    expect(res.status).toBe(204);
  });

  test('mark service session user with low permissions as valid reason', async () => {
    const res = await fetch(`${API_URL}/service/absence`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_session_id: 1,
        username: 'testuser2',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken2}` },
    });
    expect(res.status).toBe(204);
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

  test('delete service session users', async () => {
    const res = await fetch(`${API_URL}/service/session_user_bulk`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_session_id: 1,
        usernames: ['testuser2'],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });
  afterAll(async () => {
    await recreateDB();
  });
});
