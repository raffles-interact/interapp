import { UserModel } from '@models/user';
import { AuthModel } from '@models/auth';
import { ServiceModel } from '@models/service';
import { User } from '@db/entities/user';
import { Service } from '@db/entities/service';
import { describe, expect, test, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';

describe('Unit (user)', () => {
  beforeAll(async () => {
    await recreateDB();
    await AuthModel.signUp(1, 'testuser', 'safjsakdj@jfkljlfa', 'password');
    await AuthModel.signUp(2, 'testuser2', 'safjsakdj@jfkljlfa', 'password');
    await ServiceModel.createService({
      name: 'testservice',
      description: 'testservice',
      contact_email: 'fjsaljf@jklfdj',
      day_of_week: 0,
      start_time: '12:00',
      end_time: '13:00',
      service_ic_username: 'testuser',
    }); // should create service with service_id 1
    await ServiceModel.createService({
      name: 'testservice2',
      description: 'testservice2',
      contact_email: 'fjsaljf@jklfdj',
      day_of_week: 0,
      start_time: '12:00',
      end_time: '13:00',
      service_ic_username: 'testuser2',
    }); // should create service with service_id 2
  });

  test('get user', async () => {
    const user = await UserModel.getUser('testuser');
    expect(user).toMatchObject(User);
  });

  test('change email', async () => {
    await UserModel.changeEmail('testuser', 'newemail@newemail');
    const user = await UserModel.getUser('testuser');
    expect(user.email).toBe('newemail@newemail');
  });

  test('change password', async () => {
    await UserModel.changePassword('testuser', 'password', 'newpassword');
    // attempt to sign in with old password
    await expect(async () => await AuthModel.signIn('testuser', 'password')).toThrow(
      'The password you entered is incorrect',
    );
    // attempt to sign in with new password
    await expect(async () => await AuthModel.signIn('testuser', 'newpassword')).not.toThrow();
  });

  test('reset password', async () => {
    const token = await UserModel.sendResetPasswordEmail('testuser');
    const pw = await UserModel.resetPassword(token);
    // attempt to sign in with new password
    await expect(async () => await AuthModel.signIn('testuser', pw)).not.toThrow();
  });

  test('reset password with invalid token', async () => {
    await expect(async () => await UserModel.resetPassword('invalidtoken')).toThrow(
      'The token you provided is invalid',
    );
  });

  test('send reset password email with invalid user', async () => {
    await expect(
      async () => await UserModel.sendResetPasswordEmail('sdfjsdakfjdslakfjsldakfjl;s'),
    ).toThrow('The user with username sdfjsdakfjdslakfjsldakfjl;s was not found in the database');
  });

  test('verify email', async () => {
    const token = await UserModel.sendVerifyEmail('testuser');
    await UserModel.verifyEmail(token);
    const user = await UserModel.getUser('testuser');
    expect(user.verified).toBe(true);
  });

  test('verify email with invalid token', async () => {
    await expect(async () => await UserModel.verifyEmail('invalidtoken')).toThrow(
      'The token you provided is invalid',
    );
  });

  test('send verify email with invalid user', async () => {
    await expect(
      async () => await UserModel.sendVerifyEmail('sdfjsdakfjdslakfjsldakfjl;s'),
    ).toThrow('The user with username sdfjsdakfjdslakfjsldakfjl;s was not found in the database');
  });

  test('check permissions', async () => {
    const perms = await UserModel.checkPermissions('testuser');
    expect(perms).toEqual([0]);
  });

  test('update permissions', async () => {
    await UserModel.updatePermissions('testuser', [0, 1]);
    const perms = await UserModel.checkPermissions('testuser');
    expect(perms).toEqual([0, 1]);
  });

  test('get all services by user', async () => {
    expect(() => UserModel.getAllServicesByUser('testuser')).toThrow(
      'The user with username testuser has no services',
    );
    // insert service
    await UserModel.addServiceUser(1, 'testuser');
    expect(() => UserModel.getAllServicesByUser('testuser')).not.toThrow(
      'The user with username testuser has no services',
    );
    expect((await UserModel.getAllServicesByUser('testuser'))[0]).toMatchObject({
      service_id: 1,
      name: 'testservice',
      description: 'testservice',
      contact_email: 'fjsaljf@jklfdj',
      day_of_week: 0,
      start_time: '12:00:00',
      end_time: '13:00:00',
      service_ic_username: 'testuser',
    });
  });

  test('get all users by service', async () => {
    expect(() => UserModel.getAllUsersByService(1)).not.toThrow(
      'The service with service_id 1 has no users',
    );
    expect((await UserModel.getAllUsersByService(1))[0]).toMatchObject({
      user_id: 1,
      username: 'testuser',
      email: 'newemail@newemail',
      verified: true,
      service_hours: 0,
    });
  });

  test('add service user', async () => {
    await UserModel.addServiceUser(2, 'testuser');
    expect((await UserModel.getAllServicesByUser('testuser'))[1]).toMatchObject({
      service_id: 2,
      name: 'testservice2',
      description: 'testservice2',
      contact_email: 'fjsaljf@jklfdj',
      day_of_week: 0,
      start_time: '12:00:00',
      end_time: '13:00:00',
      service_ic_username: 'testuser2',
      contact_number: null,
      website: null,
      promotional_image: null,
    } as Partial<Service>);
  });

  test('remove service user', async () => {
    await UserModel.removeServiceUser(2, 'testuser');
    await UserModel.removeServiceUser(1, 'testuser');
    expect(() => UserModel.getAllServicesByUser('testuser')).toThrow(
      'The user with username testuser has no services',
    );
  });

  test('bulk update service users (add)', async () => {
    await UserModel.updateServiceUserBulk(1, [
      {
        action: 'add',
        username: 'testuser',
      },
      {
        action: 'add',
        username: 'testuser2',
      },
    ]);
    expect(() => UserModel.getAllServicesByUser('testuser')).not.toThrow(
      'The user with username testuser has no services',
    );
    expect(() => UserModel.getAllServicesByUser('testuser2')).not.toThrow(
      'The user with username testuser2 has no services',
    );
  });

  test('bulk update service users (remove)', async () => {
    await UserModel.updateServiceUserBulk(1, [
      {
        action: 'remove',
        username: 'testuser',
      },
    ]);
    expect(() => UserModel.getAllServicesByUser('testuser')).toThrow(
      'The user with username testuser has no services',
    );
  });

  test('bulk update service users (mixed)', async () => {
    await UserModel.updateServiceUserBulk(1, [
      {
        action: 'remove',
        username: 'testuser2',
      },
      {
        action: 'add',
        username: 'testuser',
      },
    ]);
    expect(() => UserModel.getAllServicesByUser('testuser')).not.toThrow(
      'The user with username testuser has no services',
    );
    expect(() => UserModel.getAllServicesByUser('testuser2')).toThrow(
      'The user with username testuser2 has no services',
    );
  });

  test('get all users', async () => {
    const users = await UserModel.getUserDetails();
    expect(users).toBeArray();
    expect(users).toHaveLength(2);
  });

  test('get 1st user', async () => {
    const user = await UserModel.getUserDetails('testuser');
    expect(user).toMatchObject({
      user_id: 1,
      username: 'testuser',
      email: 'newemail@newemail',
      verified: true,
      service_hours: 0,
    });
  });

  test('get permissions of all users', async () => {
    const perms = await UserModel.getPermissions();
    expect(perms).toMatchObject({
      testuser: [0, 1],
      testuser2: [0],
    });
  });

  test('get permissions of user', async () => {
    const perms = await UserModel.getPermissions('testuser');
    expect(perms).toMatchObject({
      testuser: [0, 1],
    });
  });

  test('add service hours', async () => {
    await UserModel.updateServiceHours('testuser', 10);
    const user = await UserModel.getUser('testuser');
    expect(user.service_hours).toBe(10);
  });

  test('add service hours with invalid user', async () => {
    await expect(async () => await UserModel.updateServiceHours('invaliduser', 10)).toThrow(
      'The user with username invaliduser was not found in the database',
    );
  });

  test('delete user', async () => {
    await UserModel.deleteUser('testuser');
    await expect(async () => await UserModel.getUser('testuser')).toThrow(
      'The user with username testuser was not found in the database',
    );
  });
  afterAll(async () => {
    await recreateDB();
  });
});
