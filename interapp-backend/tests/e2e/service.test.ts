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

  test('add service to user', async () => {
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

  test('get all services by user', async () => {
    const res = await fetch(`${API_URL}/user/userservices?username=testuser`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject([
      {
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
      },
      {
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

  test('delete service session', async () => {
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'DELETE',
      body: JSON.stringify({
        service_session_id: 1,
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
    expect(res3.status).toBe(201);
    const res4 = await fetch(`${API_URL}/service/session_user_bulk`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 3,
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

  test('create new service', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service',
        description: 'test description',
        contact_email: 'fejfioe@jfiodjf',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        service_ic_username: 'serviceic',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_id: 4,
    });
  });

  test('create non ad hoc service session', async () => {
    const res = await fetch(`${API_URL}/service/session`, {
      method: 'POST',
      body: JSON.stringify({
        service_id: 4,
        start_time: '2023-11-27T16:42Z',
        end_time: '2023-11-27T17:42Z',
        ad_hoc_enabled: false,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service_session_id: 4,
    });
  });

  test('add ad hoc user to non ad hoc service session', async () => {
    const res = await fetch(`${API_URL}/service/session_user`, {
      method: 'POST',
      body: JSON.stringify({
        service_session_id: 4,
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
        service_session_id: 4,
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
        service_session_id: 4,
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

  test('delete service ic', async () => {
    const res = await fetch(`${API_URL}/user/userservices`, {
      method: 'DELETE',
      body: JSON.stringify({
        username: 'serviceic',
        service_id: 4,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204); // should have no effect on past records
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
        service_id: 4,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const res6 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser4',
        service_id: 4,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const res7 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser5',
        service_id: 4,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const res8 = await fetch(`${API_URL}/user/userservices`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser6',
        service_id: 4,
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
        service_id: 4,
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
        service_session_id: 4,
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

  afterAll(async () => {
    await recreateDB();
  });
});