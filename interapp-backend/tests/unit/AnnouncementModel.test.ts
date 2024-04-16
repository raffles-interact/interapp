import { runSuite, testSuites } from '../constants.test';
import { AuthModel, AnnouncementModel } from '@models/.';
import { User } from '@db/entities';
import { expect } from 'bun:test';
import { recreateDB } from '../utils';
import { readFileSync } from 'fs';

const SUITE_NAME = 'AnnouncementModel';
const suite = testSuites[SUITE_NAME];
type MulterFile = Express.Multer.File;

const signUpUser = async (id: number, name: string) =>
  await AuthModel.signUp(id, name, 'sfsajhjkh@fdjfas', 'pass');

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

suite.getAnnouncement = [
  {
    name: 'should get announcement',
    cb: async () => {
      await signUpUser(1, 'testuser');
      await signUpUser(2, 'testuser2');
      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        attachments: [],
      });
      expect(id).toBe(1);

      const announcement = await AnnouncementModel.getAnnouncement(1);
      expect(announcement).toBeDefined();
      expect(announcement).toMatchObject({
        announcement_id: 1,
        creation_date: expect.any(Date),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        announcement_attachments: [],
        image: null,
      });
      expect(announcement.announcement_completions).toBeArrayOfSize(2);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should get announcement with attachments',
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
      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title2',
        attachments: [file as MulterFile],
      });
      expect(id).toBe(1);

      const announcement = await AnnouncementModel.getAnnouncement(1);
      expect(announcement).toBeDefined();
      expect(announcement).toMatchObject({
        announcement_id: 1,
        creation_date: expect.any(Date),
        description: 'test description',
        username: 'testuser',
        title: 'test title2',
        announcement_completions: expect.any(Array),
        image: null,
      });
      expect(announcement.announcement_attachments).toBeArrayOfSize(1);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should get announcement with image',
    cb: async () => {
      await signUpUser(1, 'testuser');
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;
      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title2',
        image: imgB64,
      });
      expect(id).toBe(1);

      const announcement = await AnnouncementModel.getAnnouncement(1);
      expect(announcement).toBeDefined();
      expect(announcement).toMatchObject({
        announcement_id: 1,
        creation_date: expect.any(Date),
        description: 'test description',
        username: 'testuser',
        title: 'test title2',
        announcement_attachments: [],
        image: expect.any(String),
      });
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should not get announcement',
    cb: async () => {
      expect(AnnouncementModel.getAnnouncement(1)).rejects.toThrow();
    },
  },
];

suite.getAnnouncements = [
  {
    name: 'should get announcements',
    cb: async () => {
      await signUpUser(1, 'testuser');
      await signUpUser(2, 'testuser2');
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;

      const pdf = readFileSync('tests/utils/assets/blank.pdf');
      const file = {
        fieldname: 'file',
        originalname: 'blank.pdf',
        encoding: 'utf-8',
        mimetype: 'application/pdf',
        buffer: pdf,
        size: 0,
      };

      for (let i = 0; i < 100; i++) {
        await AnnouncementModel.createAnnouncement({
          creation_date: new Date().toISOString(),
          description: 'test description',
          username: 'testuser',
          title: 'test title' + i,
          attachments: i % 2 === 0 ? ([file, file, file] as MulterFile[]) : [],
          image: i % 2 === 0 ? imgB64 : null,
        });
      }

      const announcements = await AnnouncementModel.getAnnouncements();
      expect(announcements.data).toBeArrayOfSize(100);
      expect(announcements.total_entries).toBe(100);
      expect(announcements.length_of_page).toBe(100);

      const pagedAnnouncements = await AnnouncementModel.getAnnouncements(1, 10);
      expect(pagedAnnouncements.data).toBeArrayOfSize(10);
      expect(pagedAnnouncements.total_entries).toBe(100);
      expect(pagedAnnouncements.length_of_page).toBe(10);

      expect(pagedAnnouncements.data[0]).toMatchObject({
        announcement_id: 100,
        creation_date: expect.any(Date),
        description: 'test description',
        username: 'testuser',
        title: 'test title99',
        announcement_attachments: expect.any(Array),
        announcement_completions: expect.any(Array),
        image: null,
      });
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should not get announcements',
    cb: async () => {
      const announcements = await AnnouncementModel.getAnnouncements();
      expect(announcements.data).toBeArrayOfSize(0);
      expect(announcements.total_entries).toBe(0);
      expect(announcements.length_of_page).toBe(0);
    },
  },
];

suite.updateAnnouncement = [
  {
    name: 'should update announcement',
    cb: async () => {
      await signUpUser(1, 'testuser');
      await signUpUser(2, 'testuser2');
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;
      const pdf = readFileSync('tests/utils/assets/blank.pdf');
      const file = {
        fieldname: 'file',
        originalname: 'blank.pdf',
        encoding: 'utf-8',
        mimetype: 'application/pdf',
        buffer: pdf,
        size: 0,
      };
      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        attachments: [file as MulterFile],
        image: imgB64,
      });
      expect(id).toBe(1);

      //update
      const updated = await AnnouncementModel.updateAnnouncement({
        announcement_id: 1,
        description: 'updated description',
        title: 'updated title',
        attachments: [],
        image: null,
      });

      expect(updated).toMatchObject({
        announcement_id: 1,
        creation_date: expect.any(Date),
        description: 'updated description',
        username: 'testuser',
        title: 'updated title',
        user: expect.any(User),
        image: null,
      });
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should not update announcement',
    cb: async () => {
      expect(AnnouncementModel.updateAnnouncement({ announcement_id: 1 })).rejects.toThrow();
    },
  },
];

suite.deleteAnnouncement = [
  {
    name: 'should delete announcement',
    cb: async () => {
      await signUpUser(1, 'testuser');
      //create
      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        attachments: [],
      });
      expect(id).toBe(1);

      //delete
      expect(AnnouncementModel.deleteAnnouncement(1)).resolves.toBeUndefined();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should not delete announcement',
    cb: async () => {
      expect(AnnouncementModel.deleteAnnouncement(1)).rejects.toThrow();
    },
  },
];

suite.getAnnouncementCompletions = [
  {
    name: 'should get announcement completions',
    cb: async () => {
      for (let i = 0; i < 10; i++) {
        await signUpUser(i, 'testuser' + i);
      }

      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser0',
        title: 'test title',
        attachments: [],
      });
      expect(id).toBe(1);

      const completions = await AnnouncementModel.getAnnouncementCompletions(1);

      expect(Object.entries(completions)).toBeArrayOfSize(10);
      for (const [, completion] of Object.entries(completions)) {
        expect(completion).toBeFalse();
      }
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should not get announcement completions',
    cb: async () => {
      expect(AnnouncementModel.getAnnouncementCompletions(1)).rejects.toThrow();
    },
  },
];

suite.updateAnnouncementCompletion = [
  {
    name: 'should update announcement completion',
    cb: async () => {
      for (let i = 0; i < 10; i++) {
        await signUpUser(i, 'testuser' + i);
      }

      const id = await AnnouncementModel.createAnnouncement({
        creation_date: new Date().toISOString(),
        description: 'test description',
        username: 'testuser0',
        title: 'test title',
        attachments: [],
      });
      expect(id).toBe(1);

      const completions = await AnnouncementModel.getAnnouncementCompletions(1);
      expect(Object.entries(completions)).toBeArrayOfSize(10);

      //update
      await AnnouncementModel.updateAnnouncementCompletion(1, 'testuser0', true);
      await AnnouncementModel.updateAnnouncementCompletion(1, 'testuser1', true);

      const updatedCompletions = await AnnouncementModel.getAnnouncementCompletions(1);
      expect(updatedCompletions['testuser0']).toBeTrue();
      expect(updatedCompletions['testuser1']).toBeTrue();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should not update announcement completion',
    cb: async () => {
      expect(AnnouncementModel.updateAnnouncementCompletion(1, 'testuser', true)).rejects.toThrow();
    },
  },
];

runSuite(SUITE_NAME, suite);
