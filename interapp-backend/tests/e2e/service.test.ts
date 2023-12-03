import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission, ServiceSession, ServiceSessionUser } from '@db/entities';

const API_URL = process.env.API_URL;

describe('API (service)', async () => {
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
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 999,
        username: 'serviceic',
        email: 'tes234141@example.com',
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
      await appDataSource.manager.insert(UserPermission, {
        user: user!,
        username: 'testuser',
        permission_id: 2,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  });

  test('create valid service', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service',
        description: 'test description',
        contact_email: 'asjlfkjfl@jkljfl.com',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 'serviceic',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_id: 1,
    });
  });

  test('create multiple services', async () => {
    const res2 = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service 2',
        description: 'test description2',
        contact_email: 'fksalfjasklf@fkjkdsjglk',
        day_of_week: 2,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 'testuser',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    expect(await res2.json()).toMatchObject({
      service_id: 2,
    });

    const res3 = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service3',
        contact_email: 'fksalfjasklf@fkjkdsjglk',
        day_of_week: 2,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 'testuser2',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res3.status).toBe(200);
    expect(await res3.json()).toMatchObject({
      service_id: 3,
    });
  });

  test('create invalid service', async () => {
    // create with no valid service_ic
    const invalidres = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service',
        description: 'test description',
        contact_email: 'asjlfkjfl@jkljfl.com',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 1234,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(invalidres.status).toBe(404);
  });

  test('update service name and description', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 1,
        name: 'new name',
        description: 'new description',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_id: 1,
      name: 'new name',
      description: 'new description',
      contact_email: 'asjlfkjfl@jkljfl.com',
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '10:00:00',
      contact_number: null,
      website: null,
      promotional_image: null,
      service_ic_username: 'serviceic',
    });
  });

  test("update service's service ic", async () => {
    // update service_ic
    const res2 = await fetch(`${API_URL}/service`, {
      method: 'PATCH',
      body: JSON.stringify({
        service_id: 1,
        service_ic_username: 'serviceic',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    expect(await res2.json()).toMatchObject({
      service_id: 1,
      name: 'new name',
      description: 'new description',
      contact_email: 'asjlfkjfl@jkljfl.com',
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '10:00:00',
      contact_number: null,
      website: null,
      promotional_image: null,
      service_ic_username: 'serviceic',
    });
  });

  test('get services', async () => {
    const res = await fetch(`${API_URL}/service?service_id=1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_id: 1,
      name: 'new name',
      description: 'new description',
      contact_email: 'asjlfkjfl@jkljfl.com',
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '10:00:00',
      contact_number: null,
      website: null,
      promotional_image: null,
      service_ic_username: 'serviceic',
    });

    const res2 = await fetch(`${API_URL}/service?service_id=2`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    expect(await res2.json()).toMatchObject({
      service_id: 2,
      name: 'test service 2',
      description: 'test description2',
      contact_email: 'fksalfjasklf@fkjkdsjglk',
      day_of_week: 2,
      start_time: '09:00:00',
      end_time: '10:00:00',
      contact_number: null,
      website: null,
      promotional_image: null,
      service_ic_username: 'testuser',
    });
  });

  test('delete service', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_id: 3,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  // create 2 more service sessions with the same service id and insert 2 users into each
  test('create multiple service sessions + populated', async () => {
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
    const res2 = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 1,
        start_time: '2023-12-27T16:42Z',
        end_time: '2023-12-27T17:42Z',
        ad_hoc_enabled: true,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);

    const res3 = await fetch(`${API_URL}/service/session_user_bulk`, {
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
    expect(res3.status).toBe(201);
    const res4 = await fetch(`${API_URL}/service/session_user_bulk`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 2,
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
    expect(res4.status).toBe(201);
  });

  test('delete service with a cascade', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_id: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
    // ensure service sessions and service session users are deleted
    const res2 = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session')
      .from(ServiceSession, 'service_session')
      .where('service_id = :id', { id: 1 })
      .execute();
    expect(res2.length).toBe(0);
    const res3 = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session_user')
      .from(ServiceSessionUser, 'service_session_user')
      .where('service_session_id IN (:...id)', { id: [2, 3] })
      .execute();
    expect(res3.length).toBe(0);
  });

  afterAll(async () => {
    await recreateDB();
  });
}); 