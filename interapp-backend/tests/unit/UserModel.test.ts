import { testSuites } from '../constants.test';
import { AuthModel, UserModel, ServiceModel } from '../../api/models';
import { describe, test, expect } from 'bun:test';
import { recreateDB, recreateRedis } from '../utils';
import redisClient from '@utils/init_redis';
import { Permissions } from '@utils/permissions';

const suite = testSuites.UserModel;

const signUp = async (id: number, username: string) =>
  AuthModel.signUp(id, username, 'test@email.com', 'pass');

suite.getUser = [
  {
    name: 'should return user',
    cb: async () => {
      await signUp(1, 'user');
      const result = await UserModel.getUser('user');
      expect(result).toBeObject();
      expect(result).toMatchObject({
        user_id: 1,
        username: 'user',
        email: 'test@email.com',
      });
      expect(result.password_hash).not.toBe('pass'); // should be hashed
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.getUser('user')).rejects.toThrow();
    },
  },
  {
    name: 'should get back all users',
    cb: async () => {
      for (let i = 0; i < 5; i++) {
        await signUp(i, `user${i}`);
      }
      for (let i = 0; i < 5; i++) {
        const result = await UserModel.getUser(`user${i}`);
        expect(result).toBeObject();
        expect(result).toMatchObject({
          user_id: i,
          username: `user${i}`,
          email: 'test@email.com',
        });
      }
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.deleteUser = [
  {
    name: 'should delete user',
    cb: async () => {
      await signUp(1, 'user');
      await UserModel.deleteUser('user');
      expect(UserModel.getUser('user')).rejects.toThrow();
    },
  },
  {
    name: 'should do nothing when user does not exist',
    cb: async () => {
      expect(UserModel.deleteUser('user')).resolves.toBeUndefined();
      expect(UserModel.getUser('user')).rejects.toThrow();
    },
  },
];

suite.getUserDetails = [
  {
    name: 'should return user details',
    cb: async () => {
      await signUp(1, 'user');
      const result = await UserModel.getUserDetails('user');
      /*
      'user.username',
        'user.email',
        'user.verified',
        'user.user_id',
        'user.service_hours',
        'user.profile_picture',
      */
      expect(result).toMatchObject({
        username: 'user',
        email: 'test@email.com',
        verified: false,
        user_id: 1,
        service_hours: 0,
        profile_picture: null,
      });

      expect(result).not.toHaveProperty('password_hash');
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.getUserDetails('user')).rejects.toThrow();
    },
  },
  {
    name: 'should return all user details',
    cb: async () => {
      for (let i = 0; i < 5; i++) {
        await signUp(i, `user${i}`);
      }

      const result = (await UserModel.getUserDetails()) as unknown[];
      expect(result).toBeArrayOfSize(5);

      for (let i = 0; i < 5; i++) {
        expect(result[i]).toMatchObject({
          username: `user${i}`,
          email: 'test@email.com',
          verified: false,
          user_id: i,
          service_hours: 0,
          profile_picture: null,
        });
        expect(result[i]).not.toHaveProperty('password_hash');
      }
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should return nothing when no users',
    cb: async () => {
      const result = await UserModel.getUserDetails();
      expect(result).toBeArrayOfSize(0);
    },
  },
];

suite.changeEmail = [
  {
    name: 'should change email',
    cb: async () => {
      await signUp(1, 'user');
      await UserModel.changeEmail('user', 'test2@email.com');
      const result = await UserModel.getUser('user');
      expect(result).toHaveProperty('email');
      expect(result.email).toBe('test2@email.com');

      expect(result).toHaveProperty('verified');
      expect(result.verified).toBeFalse();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.changeEmail('user', 'a')).rejects.toThrow();
    },
  },
];

suite.changePassword = [
  {
    name: 'should change password',
    cb: async () => {
      await signUp(1, 'user');
      await UserModel.changePassword('user', 'pass', 'newpass');
      const result = await UserModel.getUser('user');
      expect(result).toHaveProperty('password_hash');
      expect(result.password_hash).not.toBe('newpass');

      expect(Bun.password.verify('newpass', result.password_hash)).resolves.toBeTrue();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.changePassword('user', 'pass', 'a')).rejects.toThrow();
    },
  },
];

suite.sendResetPasswordEmail = [
  {
    name: 'should send reset password email',
    cb: async () => {
      await signUp(1, 'user');
      const token = await UserModel.sendResetPasswordEmail('user');
      expect(token).toBeString();
      expect(token).toHaveLength(256);
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.sendResetPasswordEmail('user')).rejects.toThrow();
    },
  },
];

suite.resetPassword = [
  {
    name: 'should reset password',
    cb: async () => {
      await signUp(1, 'user');
      const token = await UserModel.sendResetPasswordEmail('user');
      const newPass = await UserModel.resetPassword(token);
      const result = await UserModel.getUser('user');
      expect(result).toHaveProperty('password_hash');
      expect(result.password_hash).not.toBe('pass');
      expect(Bun.password.verify(newPass, result.password_hash)).resolves.toBeTrue();
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should throw when token is invalid',
    cb: async () => {
      expect(UserModel.resetPassword('a')).rejects.toThrow();
    },
  },
  {
    name: 'should throw when token is expired',
    cb: async () => {
      await signUp(1, 'user');
      const token = await UserModel.sendResetPasswordEmail('user');
      await redisClient.del(`resetpw:${token}`);

      expect(UserModel.resetPassword(token)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
];

suite.sendVerifyEmail = [
  {
    name: 'should send verify email',
    cb: async () => {
      await signUp(1, 'user');
      const token = await UserModel.sendVerifyEmail('user');
      expect(token).toBeString();
      expect(token).toHaveLength(256);
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.sendVerifyEmail('user')).rejects.toThrow();
    },
  },
];

suite.verifyEmail = [
  {
    name: 'should verify email',
    cb: async () => {
      await signUp(1, 'user');
      const token = await UserModel.sendVerifyEmail('user');
      await UserModel.verifyEmail(token);
      const result = await UserModel.getUser('user');
      expect(result).toHaveProperty('verified');
      expect(result.verified).toBeTrue();
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should throw when token is invalid',
    cb: async () => {
      expect(UserModel.verifyEmail('a')).rejects.toThrow();
    },
  },
  {
    name: 'should throw when token is expired',
    cb: async () => {
      await signUp(1, 'user');
      const token = await UserModel.sendVerifyEmail('user');
      await redisClient.del(`verify:${token}`);
      expect(UserModel.verifyEmail(token)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
];

suite.updatePermissions = [
  {
    name: 'should update permissions',
    cb: async () => {
      await signUp(1, 'user');
      await UserModel.updatePermissions('user', [
        Permissions.VISTOR,
        Permissions.ATTENDANCE_MANAGER,
        Permissions.ADMIN,
      ]);
      const result = await UserModel.checkPermissions('user');
      expect(result).toBeArrayOfSize(3);
      expect(result).toEqual([
        Permissions.VISTOR,
        Permissions.ATTENDANCE_MANAGER,
        Permissions.ADMIN,
      ]);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(
        UserModel.updatePermissions('user', [
          Permissions.VISTOR,
          Permissions.ATTENDANCE_MANAGER,
          Permissions.ADMIN,
        ]),
      ).rejects.toThrow();
    },
  },
];

suite.checkPermissions = [
  {
    name: 'should return permissions',
    cb: async () => {
      await signUp(1, 'user');
      const all = Object.values(Permissions).filter((v) => typeof v !== 'string') as Permissions[];
      await UserModel.updatePermissions('user', all);
      const result = await UserModel.checkPermissions('user');
      expect(result).toBeArrayOfSize(all.length);
      expect(result).toEqual(all);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.checkPermissions('user')).rejects.toThrow();
    },
  },
];

suite.getPermissions = [
  {
    name: 'should return permissions',
    cb: async () => {
      await signUp(1, 'user');
      const all = Object.values(Permissions).filter((v) => typeof v !== 'string') as Permissions[];
      await UserModel.updatePermissions('user', all);
      const result = await UserModel.getPermissions('user');
      expect(result).toHaveProperty('user');
      expect(result.user).toBeArrayOfSize(all.length);
      expect(result.user).toEqual(all);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should get all permissions from all users',
    cb: async () => {
      for (let i = 0; i < 5; i++) {
        await signUp(i, `user${i}`);
        await UserModel.updatePermissions(`user${i}`, [Permissions.ADMIN]);
      }
      const result = await UserModel.getPermissions();
      expect(Object.entries(result)).toBeArrayOfSize(5);

      for (let i = 0; i < 5; i++) {
        expect(result[`user${i}`]).toBeArrayOfSize(1);
        expect(result[`user${i}`]).toEqual([Permissions.ADMIN]);
      }
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should return nothing when no users',
    cb: async () => {
      expect(UserModel.getPermissions()).rejects.toThrow();
    },
  },
];

suite.addServiceUser = [
  {
    name: 'should add service user',
    cb: async () => {
      await signUp(1, 'user');
      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'user',
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);
      await UserModel.addServiceUser(1, 'user');

      const result = await UserModel.getAllServicesByUser('user');
      expect(result).toBeArrayOfSize(1);
      expect(result[0]).toMatchObject({
        service_id: 1,
        contact_number: null,
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        promotional_image: null,
        website: null,
        service_ic_username: 'user',
        service_hours: 1,
        enable_scheduled: true,
      });
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.addServiceUser(1, 'user')).rejects.toThrow();
    },
  },
  {
    name: 'should throw when service does not exist',
    cb: async () => {
      await signUp(1, 'user');
      expect(UserModel.addServiceUser(1, 'user')).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should add multiple service users',
    cb: async () => {
      for (let i = 0; i < 10; i++) {
        await signUp(i, `user${i}`);
        const id = await ServiceModel.createService({
          name: `test service ${i}`,
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 1,
          start_time: '10:00',
          end_time: '11:00',
          service_ic_username: `user${i}`,
          service_hours: 1,
          enable_scheduled: true,
        });
        expect(id).toBe(i + 1);
        await UserModel.addServiceUser(i + 1, `user${i}`);
      }
      for (let i = 0; i < 10; i++) {
        expect(UserModel.getAllServicesByUser(`user${i}`)).resolves.toBeArrayOfSize(1);
      }
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.removeServiceUser = [
  {
    name: 'should remove service user',
    cb: async () => {
      await signUp(1, 'user');
      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'user',
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);

      await UserModel.addServiceUser(1, 'user');
      const resultAdded = await UserModel.getAllServicesByUser('user');

      expect(resultAdded).toBeArrayOfSize(1);

      await UserModel.removeServiceUser(1, 'user');
      expect(UserModel.getAllServicesByUser('user')).rejects.toThrow(
        'The user with username user has no services',
      );
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user does not exist',
    cb: async () => {
      expect(UserModel.removeServiceUser(1, 'user')).resolves.toBeUndefined();
    },
  },
  {
    name: 'should throw when service does not exist',
    cb: async () => {
      await signUp(1, 'user');
      expect(UserModel.removeServiceUser(1, 'user')).resolves.toBeUndefined();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw when user is not in service',
    cb: async () => {
      await signUp(1, 'user');
      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'user',
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);
      expect(UserModel.removeServiceUser(1, 'user')).resolves.toBeUndefined();

      expect(UserModel.getAllServicesByUser('user')).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should remove multiple service users',
    cb: async () => {
      for (let i = 0; i < 10; i++) {
        await signUp(i, `user${i}`);
        const id = await ServiceModel.createService({
          name: `test service ${i}`,
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 1,
          start_time: '10:00',
          end_time: '11:00',
          service_ic_username: `user${i}`,
          service_hours: 1,
          enable_scheduled: true,
        });
        expect(id).toBe(i + 1);
        await UserModel.addServiceUser(i + 1, `user${i}`);
      }
      for (let i = 0; i < 10; i++) {
        await UserModel.removeServiceUser(i + 1, `user${i}`);
        expect(UserModel.getAllServicesByUser(`user${i}`)).rejects.toThrow();
      }
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.updateServiceUserBulk = [
  {
    name: 'should update service user bulk',
    cb: async () => {
      for (let i = 0; i < 10; i++) {
        await signUp(i, `user${i}`);
      }

      // create 2 svcs
      const svc1 = await ServiceModel.createService({
        name: `test service`,
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'user0',
        service_hours: 1,
        enable_scheduled: true,
      });

      const svc2 = await ServiceModel.createService({
        name: `test service 2`,
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'user1',
        service_hours: 1,
        enable_scheduled: true,
      });

      expect(svc1).toBe(1);
      expect(svc2).toBe(2);

      // add everyone to svc1
      for (let i = 0; i < 10; i++) {
        await UserModel.addServiceUser(1, `user${i}`);
      }

      // test add and remove

      const toAdd = [1, 2, 3].map((i) => ({
        username: `user${i}`,
        action: 'add' as const,
      }));
      const toRemove = [4, 5, 6].map((i) => ({
        username: `user${i}`,
        action: 'remove' as const,
      }));

      await UserModel.updateServiceUserBulk(2, toAdd);
      await UserModel.updateServiceUserBulk(1, toRemove);

      const result = await UserModel.getAllServicesByUser('user1');
      expect(result).toBeArrayOfSize(2);

      expect(UserModel.getAllServicesByUser('user4')).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.getAllServicesByUser = [
  {
    name: 'should get services from username',
    cb: async () => {
      await signUp(1, 'user');
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.getAllServiceSessionsByUser = [];

suite.getAllUsersByService = [];

suite.updateServiceHours = [];

suite.updateProfilePicture = [];

suite.deleteProfilePicture = [];

suite.getNotifications = [];

console.log(suite);
describe('UserModel', () => {
  for (const [method, tests] of Object.entries(suite)) {
    describe(method, async () => {
      for (const { name, cb, cleanup } of tests) {
        test(name, async () => {
          try {
            await cb();
          } finally {
            if (cleanup) await cleanup();
          }
        });
      }
    });
  }
  test.todo('make sure suite is exhaustive', () => {
    Object.values(suite).forEach((tests) => {
      expect(tests).toBeArray();
      expect(tests).not.toBeEmpty();
    });
  });
});
