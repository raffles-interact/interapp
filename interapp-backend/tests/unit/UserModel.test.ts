import { testSuites } from '../constants.test';
import { AuthModel, UserModel } from '../../api/models';
import { describe, test, expect } from 'bun:test';
import { recreateDB, recreateRedis } from '../utils';
import redisClient from '@utils/init_redis';
import { Permissions } from '@utils/permissions';
import { AttendanceStatus } from '@db/entities/service_session_user';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

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

suite.getAllServicesByUser = [];

suite.getAllServiceSessionsByUser = [];

suite.getAllUsersByService = [];

suite.addServiceUser = [];

suite.removeServiceUser = [];

suite.updateServiceUser = [];

suite.updateServiceUserBulk = [];

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
