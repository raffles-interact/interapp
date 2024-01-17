import { test, expect, describe, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';

const API_URL = process.env.API_URL;

const imageUrlToBase64 = async (url: string) => {
  const response = await fetch(url);

  const blob = await response.blob();
  const buffer = Buffer.from(await blob.text());
  return 'data:' + blob.type + ';base64,' + buffer.toString('base64');
};

describe('API (account)', async () => {
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
  });

  test('change password', async () => {
    const res = await fetch(`${API_URL}/user/password/change`, {
      method: 'PATCH',
      body: JSON.stringify({
        old_password: 'testpassword',
        new_password: 'new_password',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('change email', async () => {
    const res = await fetch(`${API_URL}/user/change_email`, {
      method: 'PATCH',
      body: JSON.stringify({
        new_email: 'new_email@new_email.com',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('change email to school email', async () => {
    const res = await fetch(`${API_URL}/user/change_email`, {
      method: 'PATCH',
      body: JSON.stringify({
        new_email: 'new_email@rafflesgirlssch.edu.sg',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(400);
  });

  test('attempt to bypass role restrictions', async () => {
    // testuser should not have admin permissions
    const res = await fetch(`${API_URL}/user/permissions`, {
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
      if (!user) throw new Error('User not found');
      await appDataSource.manager.insert(UserPermission, {
        user: user,
        username: 'testuser',
        permission_id: 6,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    const res = await fetch(`${API_URL}/user/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser',
        permissions: [0, 6],
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);

    await appDataSource.manager
      .createQueryBuilder()
      .select(['user_permissions'])
      .from(UserPermission, 'user_permissions')
      .where('user_permissions.username = :username', { username: 'testuser' })
      .getMany();
  });

  test('change email (admin)', async () => {
    const res = await fetch(`${API_URL}/user/change_email`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser',
        new_email: 'new_email@new_email.com',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('add service hours', async () => {
    const res = await fetch(`${API_URL}/user/service_hours`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser',
        hours: 10,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('add service hours (non-admin)', async () => {
    const res = await fetch(`${API_URL}/user/service_hours`, {
      method: 'PATCH',
      body: JSON.stringify({
        hours: 10,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('add service hours (non-existant)', async () => {
    const res = await fetch(`${API_URL}/user/service_hours`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'nonexistant',
        hours: 10,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(404);
  });

  test('create a new user', async () => {
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
  });

  test('add roles to new user', async () => {
    const res = await fetch(`${API_URL}/user/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser2',
        permissions: [0, 1, 2, 3, 6],
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('remove roles from user', async () => {
    const res = await fetch(`${API_URL}/user/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'testuser2',
        permissions: [0, 6],
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('get all users', async () => {
    const res = await fetch(`${API_URL}/user`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const response_as_json = (await res.json()) as Object;
    expect(response_as_json).toBeArray();
    expect(response_as_json).toHaveLength(2);
  });

  test('get user', async () => {
    const res = await fetch(`${API_URL}/user?username=testuser`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const response_as_json = (await res.json()) as Object;
    expect(response_as_json).toMatchObject({
      user_id: 1,
      username: 'testuser',
      email: 'new_email@new_email.com',
      verified: false,
      service_hours: 10,
    });
  });

  test('get user permissions', async () => {
    const res = await fetch(`${API_URL}/user/permissions?username=testuser`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      testuser: [0, 6],
    });
  });

  test('get user permissions (non-existant)', async () => {
    const res = await fetch(`${API_URL}/user/permissions?username=nonexistant`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(404);
  });

  test('get all user permissions', async () => {
    const res = await fetch(`${API_URL}/user/permissions`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      testuser: [0, 6],
      testuser2: [0, 6],
    });
  });

  test('delete user', async () => {
    const res = await fetch(`${API_URL}/user`, {
      method: 'DELETE',
      body: JSON.stringify({
        username: 'testuser2',
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('update profile picture', async () => {
    const img = await imageUrlToBase64(
      'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png',
    );

    const res = await fetch(`${API_URL}/user/profile_picture`, {
      method: 'PATCH',
      body: JSON.stringify({
        profile_picture: img,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);

    // check if profile picture is updated
    const res2 = await fetch(`${API_URL}/user?username=testuser`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res2.status).toBe(200);
    const response_as_json = (await res2.json()) as Object;
    expect(response_as_json).toMatchObject({
      user_id: 1,
      username: 'testuser',
      email: 'new_email@new_email.com',
      verified: false,
      service_hours: 10,
      profile_picture: expect.any(String),
    });
  });

  test('delete profile picture', async () => {
    const res = await fetch(`${API_URL}/user/profile_picture`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(204);
  });

  test('get notifications', async () => {
    const res = await fetch(`${API_URL}/user/notifications`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      unread_announcements: [],
      active_sessions: [],
      verified: false,
    });
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
        password: 'new_password',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);

    const response_as_json = (await res.json()) as Object;
    expect(response_as_json).toMatchObject({
      access_token: expect.any(String),
      user: {
        user_id: 1,
        username: 'testuser',
        email: 'new_email@new_email.com',
        verified: false,
        service_hours: 10,
        permissions: [0, 6],
      },
      expire: expect.any(Number),
    });
  });

  afterAll(async () => {
    await recreateDB();
  });
});
