import { test, expect, describe, afterAll } from 'bun:test';
import { recreateDB } from './utils/recreate_db';

const API_URL = process.env.API_URL;

describe('sign up and sign in endpoints', () => {
  // Test for registration endpoint
  test('create accounts', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(201);

    const res2 = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        username: 'testuser2',
        email: 'sdkjfsa@student.ri.edu.sg',
        password: 'testpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res2.status).toBe(400); // should fail because email is a school email
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
      accessToken: expect.any(String),
      user: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        verified: false,
        serviceHours: 0,
        permissions: [0],
      },
      expire: expect.any(Number),
    });
  });

  afterAll(async () => {
    await recreateDB();
  });
});
