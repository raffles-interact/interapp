import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';

const API_URL = process.env.API_URL;

describe('API (user service)', async () => {
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
        name: 'test service',
        description: 'test description',
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
        name: 'test service 2',
        description: 'test descriptionfsdkjfdsklfjdsl;f',
        contact_email: 'shutup@gmail.com',
        day_of_week: 6,
        start_time: '10:00',
        end_time: '10:01',
        service_ic_username: 'testuser2',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });

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

  test('add services to user', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        service_id: 2,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);

    const res2 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(204);
  });

  test('add services to user (invalid username)', async () => {
    const res3 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'notfound',
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res3.status).toBe(404);
  });

  test('add services to user (invalid service id)', async () => {
    const res3 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        service_id: 123123,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res3.status).toBe(404);
  });

  test('get all services by user', async () => {
    const res = await fetch(`${API_URL}/user/userservices?username=testuser`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject([
      {
        service_id: 1,
        name: 'test service',
        description: 'test description',
        contact_email: 'asjlfkjfl@jkljfl.com',
        day_of_week: 1,
        start_time: '09:00:00',
        end_time: '10:00:00',
        contact_number: null,
        website: null,
        promotional_image: null,
        service_ic_username: 'testuser',
      },
      {
        service_id: 2,
        name: 'test service 2',
        description: 'test descriptionfsdkjfdsklfjdsl;f',
        contact_email: 'shutup@gmail.com',
        day_of_week: 6,
        start_time: '10:00:00',
        end_time: '10:01:00',
        contact_number: null,
        website: null,
        promotional_image: null,
        service_ic_username: 'testuser2',
      },
    ]);
  });

  test('delete service from user', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'DELETE',
      body: JSON.stringify({
        username: 'testuser',
        service_id: 2,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);

    const res2 = await fetch(`${API_URL}/user/userservices`, {
      method: 'DELETE',
      body: JSON.stringify({
        username: 'testuser',
        service_id: 423421421,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(204);
  });

  test('get users by service', async () => {
    const res = await fetch(`${API_URL}/service/get_users_by_service?service_id=1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const res_as_json = (await res.json()) as Array<Object>;
    expect(res_as_json).toHaveLength(1);
    expect(res_as_json[0]).toMatchObject({
      user_id: 1,
      username: 'testuser',
      email: 'test@example.com',
      verified: false,
      service_hours: 0,
    });
  });

  test('bulk update service users (add)', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 1,
        data: [{ action: 'add', username: 'testuser2' }],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('bulk update service users (remove)', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 1,
        data: [{ action: 'remove', username: 'testuser2' }],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('bulk update service users (mixed)', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 2,
        data: [
          { action: 'remove', username: 'testuser2' },
          { action: 'add', username: 'testuser' },
        ],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('invalid bulk update service users', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 1,
        data: [
          { action: 'remfsdfsfsadfasfsae', username: 'testuser2' },
          { action: 'add', username: 'testuser' },
        ],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(400);
    const res2 = await fetch(`${API_URL}/user/userservices`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 9,
        data: [
          { action: 'remove', username: 'testuser2' },
          { action: 'add', username: 'testuser' },
        ],
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(404);
  });

  afterAll(async () => {
    await recreateDB();
  });
});
