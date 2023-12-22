import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';

const API_URL = process.env.API_URL;

describe('API (service session)', async () => {
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
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 2,
        username: 'testuser3',
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
  });
  test('create service session', async () => {
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 1,
    });

    // test start time after end time
    const res2 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1,
        start_time: '2023-11-27T17:42Z',
        end_time: '2023-11-27T16:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(400);

    // test non-existent service
    const res3 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1234,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res3.status).toBe(404);
  });

  test('get service session', async () => {
    const res = await fetch(`${API_URL}/service/session?service_session_id=1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 1,
      service_id: 1,
      start_time: '2023-11-27T16:42:00.000Z',
      end_time: '2023-11-27T17:42:00.000Z',
      ad_hoc_enabled: true,
    });

    const res2 = await fetch(`${API_URL}/service/session?service_session_id=1234`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(404);
  });

  test('update service session', async () => {
    // update ad_hoc_enabled
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_session_id: 1,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: false,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 1,
      service_id: 1,
      start_time: '2023-11-27T16:42:00.000Z',
      end_time: '2023-11-27T17:42:00.000Z',
      ad_hoc_enabled: false,
    });
  });

  // get it again to check it was updated
  test('get updated service session', async () => {
    const res = await fetch(`${API_URL}/service/session?service_session_id=1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 1,
      service_id: 1,
      start_time: '2023-11-27T16:42:00.000Z',
      end_time: '2023-11-27T17:42:00.000Z',
      ad_hoc_enabled: false,
    });
  });

  test('delete service session', async () => {
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_session_id: 2,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('create non ad hoc service session', async () => {
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: false,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 2,
    });
  });

  test('add ad hoc user to non ad hoc service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 2,
        username: 'testuser',
        ad_hoc: true,
        attended: 'Attended',
        is_ic: false,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(403);
  });

  test('add non ad hoc user to non ad hoc service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 2,
        username: 'testuser',
        ad_hoc: false,
        attended: 'Attended',
        is_ic: false,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(201);
  });

  test('add multiple users to non ad hoc service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user_bulk`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 2,
        users: [
          {
            username: 'testuser',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: false,
          },
          {
            username: 'testuser2',
            ad_hoc: true,
            attended: 'Attended',
            is_ic: false,
          },
        ],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(403);
  });

  test('create 4 more accounts and add to service', async () => {
    const res1 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 3,
        username: 'testuser3',
        email: 'safsf@fkro',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res2 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 4,
        username: 'testuser4',
        email: 'safsf@fkro',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res3 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 5,
        username: 'testuser5',
        email: 'safsf@fkro',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res4 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 6,
        username: 'testuser6',
        email: 'safsf@fkro',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res3.status).toBe(201);
    expect(res4.status).toBe(201);

    const res5 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser3',
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const res6 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser4',
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const res7 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser5',
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const res8 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser6',
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res5.status).toBe(204);
    expect(res6.status).toBe(204);
    expect(res7.status).toBe(204);
    expect(res8.status).toBe(204);
  });

  test('create service session with 4 users', async () => {
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);

    const res2 = await fetch(`${API_URL}/service/session_user_bulk`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 3,
        users: [
          {
            username: 'testuser3',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: false,
          },
          {
            username: 'testuser4',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: false,
          },
          {
            username: 'testuser5',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: false,
          },
          {
            username: 'testuser6',
            ad_hoc: false,
            attended: 'Attended',
            is_ic: false,
          },
        ],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(201);
  });

  test('create more services and service sessions', async () => {
    // create 1 service

    const res3 = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test sedsfdsfdsrvice3',
        contact_email: 'fksalfjasklf@fkjkdsjglk',
        day_of_week: 2,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 'testuser3',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res3.status).toBe(200);
    expect(await res3.json()).toMatchObject({
      service_id: 3,
    });

    // create 4 service sessions
    const res4 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 2,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res4.status).toBe(200);
    expect(await res4.json()).toMatchObject({
      service_session_id: 4,
    });

    const res5 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 2,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res5.status).toBe(200);
    expect(await res5.json()).toMatchObject({
      service_session_id: 5,
    });

    const res6 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 3,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res6.status).toBe(200);
    expect(await res6.json()).toMatchObject({
      service_session_id: 6,
    });

    const res7 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 3,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res7.status).toBe(200);
    expect(await res7.json()).toMatchObject({
      service_session_id: 7,
    });
  });

  test('get newly created service session', async () => {
    const res = await fetch(`${API_URL}/service/session?service_session_id=4`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 4,
      service_id: 2,
      start_time: '2023-11-27T16:42:00.000Z',
      end_time: '2023-11-27T17:42:00.000Z',
      ad_hoc_enabled: true,
    });
  });

  test('get all service sessions', async () => {
    const res = await fetch(`${API_URL}/service/session/get_all?page=1&page_size=5`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const res_json = await res.json();
    expect(res_json).toHaveProperty('data');
    expect((res_json as Record<string, unknown>).data).toBeArrayOfSize(5);

    const res2 = await fetch(`${API_URL}/service/session/get_all?page=2&page_size=5`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    const res2_json = await res2.json();
    expect(res2_json).toHaveProperty('data');
    expect((res2_json as Record<string, unknown>).data).toBeArrayOfSize(2);

    expect(res_json).toHaveProperty('total_entries');
    expect(res_json).toHaveProperty('length_of_page');

    expect((res_json as Record<string, unknown>).total_entries).toBe(7);
    expect((res_json as Record<string, unknown>).length_of_page).toBe(5);
  });

  test('get all service sessions for service', async () => {
    const res = await fetch(`${API_URL}/service/session/get_all?service_id=1&page=1&page_size=5`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const res_json = (await res.json()) as Record<string, unknown>;
    expect(res_json).toHaveProperty('data');
    expect(res_json.data).toBeArrayOfSize(3);
    (res_json.data as Record<string, unknown>[]).forEach((service_session) => {
      expect(service_session).toMatchObject({
        service_id: 1,
      });
    });
  });

  afterAll(async () => {
    await recreateDB();
  });
});
