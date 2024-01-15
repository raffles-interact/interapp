import { AnnouncementModel } from '@models/announcement';
import { AuthModel } from '@models/auth';
import { describe, expect, test, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import { recreateMinio } from '../utils/recreate_minio';
import { readFileSync } from 'fs';

type MulterFile = Express.Multer.File;

describe('Unit (announcement)', () => {
  beforeAll(async () => {
    // create new user
    await AuthModel.signUp(1, 'testuser', 'fjdskfh@jkfaf', 'testpassword');
  });

  test('create announcement', async () => {
    const announcement_id = await AnnouncementModel.createAnnouncement({
      creation_date: new Date().toISOString(),
      description: 'test description',
      username: 'testuser',
      title: 'test title',
      attachments: [],
    });
    expect(announcement_id).toBe(1);
  });
  test('create announcement with attachments', async () => {
    const pdf = readFileSync('tests/utils/assets/blank.pdf');
    const file = {
      fieldname: 'file',
      originalname: 'blank.pdf',
      encoding: 'utf-8',
      mimetype: 'application/pdf',
      buffer: pdf,
      size: 0,
    };
    const announcement_id_2 = await AnnouncementModel.createAnnouncement({
      creation_date: new Date().toISOString(),
      description: 'test description',
      username: 'testuser',
      title: 'test title2',
      attachments: [file as MulterFile],
    });
    expect(announcement_id_2).toBe(2);
  });

  test('get announcement', async () => {
    const announcement = await AnnouncementModel.getAnnouncement(1);
    expect(announcement).toMatchObject({
      announcement_id: 1,
      creation_date: expect.any(Object),
      description: 'test description',
      username: 'testuser',
      title: 'test title',
      image: null,
      announcement_attachments: [],
      announcement_completions: expect.any(Array),
    });
    expect(() => new Date(announcement.creation_date)).not.toThrow();
  });

  test('get announcements', async () => {
    const announcements = await AnnouncementModel.getAnnouncements();
    expect(announcements.data).toHaveLength(2);
    const sorted = announcements.data.sort((a, b) => a.announcement_id - b.announcement_id);
    expect(sorted).toMatchObject([
      {
        announcement_id: 1,
        creation_date: expect.any(Object),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        image: null,
        announcement_completions: expect.any(Array),
        announcement_attachments: expect.any(Array),
      },
      {
        announcement_id: 2,
        creation_date: expect.any(Object),
        description: 'test description',
        username: 'testuser',
        title: 'test title2',
        image: null,
        announcement_completions: expect.any(Array),
        announcement_attachments: expect.any(Array),
      },
    ]);
  });

  test('update announcement', async () => {
    const pdf = readFileSync('tests/utils/assets/blank.pdf');
    const file = {
      fieldname: 'file',
      originalname: 'blank.pdf',
      encoding: 'utf-8',
      mimetype: 'application/pdf',
      buffer: pdf,
      size: 0,
    };
    const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
    const imgB64 = `data:image/png;base64,${img}`;

    await AnnouncementModel.updateAnnouncement({
      announcement_id: 1,
      creation_date: new Date().toISOString(),
      description: 'updated',
      username: 'testuser',
      title: 'test title',
      image: imgB64,
      attachments: [file as MulterFile],
    });
    const announcement = await AnnouncementModel.getAnnouncement(1);
    expect(announcement).toMatchObject({
      announcement_id: 1,
      creation_date: expect.any(Object),
      description: 'updated',
      username: 'testuser',
      title: 'test title',
      image: expect.any(String),
      announcement_attachments: expect.any(Array),
    });
  });

  test('update announcement with invalid username', async () => {
    await expect(() =>
      AnnouncementModel.updateAnnouncement({
        announcement_id: 1,
        creation_date: new Date().toISOString(),
        description: 'updated',
        username: 'invalid',
        title: 'test title',
      }),
    ).toThrow('The user with username invalid was not found in the database');
  });

  test('add users and create a new announcement', async () => {
    // create more users
    await AuthModel.signUp(2, 'testuser2', 'fjdskfh@jkfaf', 'testpassword');
    await AuthModel.signUp(3, 'testuser3', 'fjdskfh@jkfaf', 'testpassword');

    // create new announcement
    const announcement_id = await AnnouncementModel.createAnnouncement({
      creation_date: new Date().toISOString(),
      description: 'test description',
      username: 'testuser',
      title: 'test title3',
      attachments: [],
    });
    expect(announcement_id).toBe(3);
  });

  test('get announcement completions', async () => {
    const completions = await AnnouncementModel.getAnnouncementCompletions(3);
    expect(completions).toMatchObject({
      testuser: false,
      testuser2: false,
      testuser3: false,
    });
  });

  test('update announcement completions', async () => {
    await AnnouncementModel.updateAnnouncementCompletion(3, 'testuser', true);
    await AnnouncementModel.updateAnnouncementCompletion(3, 'testuser2', true);
    const completions = await AnnouncementModel.getAnnouncementCompletions(3);
    expect(completions).toMatchObject({
      testuser: true,
      testuser2: true,
      testuser3: false,
    });
  });

  test('update announcement completions with invalid username', async () => {
    expect(() => AnnouncementModel.updateAnnouncementCompletion(1, 'invalid', true)).toThrow(
      'The user with username invalid was not found in the database',
    );
  });

  test('delete announcement', async () => {
    await AnnouncementModel.deleteAnnouncement(1);
    expect(() => AnnouncementModel.getAnnouncement(1)).toThrow('Announcement with id 1 not found');

    // test cascade delete
    expect(() => AnnouncementModel.getAnnouncementCompletions(1)).toThrow(
      'Announcement with id 1 not found',
    );
  });

  afterAll(async () => {
    await recreateDB();
    await recreateMinio();
  });
});
