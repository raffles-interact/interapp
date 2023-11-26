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

  test('create service', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service',
        description: 'test description',
        contact_email: 'asjlfkjfl@jkljfl.com',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      serviceId: 1,
    });

    const res2 = await fetch(`${API_URL}/service`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'test service2',
        description: 'test description2',
        contact_email: 'fksalfjasklf@fkjkdsjglk',
        day_of_week: 2,
        start_time: '09:00',
        end_time: '10:00',
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    expect(await res2.json()).toMatchObject({
      serviceId: 2,
    });
  });

  test('update service', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'PATCH',
      body: JSON.stringify({
        serviceId: 1,
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
    });
  });

  test('get service', async () => {
    const res = await fetch(`${API_URL}/service?serviceId=1`, {
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
    });

    const res2 = await fetch(`${API_URL}/service?serviceId=2`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    expect(await res2.json()).toMatchObject({
      service_id: 2,
      name: 'test service2',
      description: 'test description2',
      contact_email: 'fksalfjasklf@fkjkdsjglk',
      day_of_week: 2,
      start_time: '09:00:00',
      end_time: '10:00:00',
      contact_number: null,
      website: null,
      promotional_image: null,
    });
  });

  test('delete service', async () => {
    const res = await fetch(`${API_URL}/service`, {
      method: 'DELETE',
      body: JSON.stringify({
        serviceId: 1,
      }),
      headers: { 'Content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  afterAll(async () => {
    await recreateDB();
  });
});
