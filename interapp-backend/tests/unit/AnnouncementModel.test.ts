import { testSuites } from '../constants.test';
import { AuthModel, AnnouncementModel, UserModel } from '../../api/models';
import { User } from '@db/entities';
import { describe, test, expect } from 'bun:test';
import { recreateDB, recreateRedis } from '../utils';
import redisClient from '@utils/init_redis';
import { AttendanceStatus } from '@db/entities/service_session_user';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

const suite = testSuites.AnnouncementModel;
type MulterFile = Express.Multer.File;

const signUpUser = async (id: number, name: string) =>
  await AuthModel.signUp(id, name, 'sfsajhjkh@fdjfas', 'pass');

console.log(suite);

suite.createAnnouncement = [
  {
    name: 'should create announcement',
    cb: async () => {
      await signUpUser(1, 'testuser');
      const announcement_id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        attachments: [],
      });
      expect(announcement_id).toBe(1);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should create announcement with attachments',
    cb: async () => {
      await signUpUser(1, 'testuser');
      const pdf = readFileSync('tests/utils/assets/blank.pdf');
      const file = {
        fieldname: 'file',
        originalname: 'blank.pdf',
        encoding: 'utf-8',
        mimetype: 'application/pdf',
        buffer: pdf,
        size: 0,
      };
      const announcement_id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title2',
        attachments: [file as MulterFile],
      });
      expect(announcement_id).toBe(1);
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.getAnnouncement = [];

describe('AnnouncementModel', () => {
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
  test('make sure suite is exhaustive', () => {
    Object.values(suite).forEach((tests) => {
      expect(tests).toBeArray();
      expect(tests).not.toBeEmpty();
    });
  });
});
