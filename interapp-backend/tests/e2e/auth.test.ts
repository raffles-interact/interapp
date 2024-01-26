import { test, expect, describe, afterAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';

const API_URL = process.env.API_URL;

describe('API (auth)', () => {
  // Test for registration endpoint
  test('create accounts', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(201);
  });

  test('use school email', async () => {
    const res2 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 2,
        username: 'testuser2',
        email: 'sdkjfsa@student.ri.edu.sg',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res2.status).toBe(400); // should fail because email is a school email

    const res3 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 2,
        username: 'testuser2',
        email: 'faskj@rafflesgirlssch.edu.sg',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res3.status).toBe(400); // should fail because email is a school email
  });

  test('missing user_id', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        email: 'fffkoefk@ifgeji',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(400);
  });

  test('duplicate user_id', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 1,
        username: 'fejkdlsjlksjlskdjflasjf',
        email: 'fffkoefk@ifgeji.com',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(409);
  });

  test('missing username', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: 10,
        email: 'fffkoefk@ifgeji',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(400);
  });

  // Test for login endpoint
  test('login account', async () => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword',
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
        email: 'test@example.com',
        verified: false,
        service_hours: 0,
        permissions: [0],
      },
      expire: expect.any(Number),
    });
  });

  test('access restricted announcement endpoint', async () => {
    const res = await fetch(`${API_URL}/announcement/`, {
      method: 'POST',
      body: JSON.stringify({
        creation_date: '2020-01-01T00:00Z',
        title: 'test',
        description: 'test',
        username: 'testuser',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    await recreateDB();
  });
});
