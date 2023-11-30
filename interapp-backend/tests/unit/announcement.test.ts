import { AnnouncementModel } from '@models/announcement';
import { AuthModel } from '@models/auth';
import { describe, expect, test, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import appDataSource from '@utils/init_datasource';

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
    });
    expect(announcement_id).toBe(1);
    const announcement_id_2 = await AnnouncementModel.createAnnouncement({
      creation_date: new Date().toISOString(),
      description: 'test description',
      username: 'testuser',
      title: 'test title',
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
      attachment: null,
    });
    expect(() => new Date(announcement.creation_date)).not.toThrow();
  });

  test('get announcements', async () => {
    const announcements = await AnnouncementModel.getAnnouncements();
    expect(announcements).toMatchObject([
      {
        announcement_id: 1,
        creation_date: expect.any(Object),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        attachment: null,
      },
      {
        announcement_id: 2,
        creation_date: expect.any(Object),
        description: 'test description',
        username: 'testuser',
        title: 'test title',
        attachment: null,
      },
    ]);
  });

  test('update announcement', async () => {
    await AnnouncementModel.updateAnnouncement({
      announcement_id: 1,
      creation_date: new Date().toISOString(),
      description: 'updated',
      username: 'testuser',
      title: 'test title',
    });
    const announcement = await AnnouncementModel.getAnnouncement(1);
    expect(announcement).toMatchObject({
      announcement_id: 1,
      creation_date: expect.any(Object),
      description: 'updated',
      username: 'testuser',
      title: 'test title',
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

  test('add and get announcement completions', async () => {
    // create more users
    await AuthModel.signUp(2, 'testuser2', 'fjdskfh@jkfaf', 'testpassword');
    await AuthModel.signUp(3, 'testuser3', 'fjdskfh@jkfaf', 'testpassword');
    await AnnouncementModel.addAnnouncementCompletions(1, ['testuser2', 'testuser3']);
    await AnnouncementModel.addAnnouncementCompletions(1, ['testuser']); // should add all 3 users
    expect(await AnnouncementModel.getAnnouncementCompletions(1)).toMatchObject({
      testuser: false,
      testuser2: false,
      testuser3: false,
    });
  });

  test('add announcement completions with invalid username', async () => {
    await expect(() => AnnouncementModel.addAnnouncementCompletions(1, ['invalid'])).toThrow(
      'The user with username invalid was not found in the database',
    );
  });

  test('update announcement completions', async () => {
    await AnnouncementModel.updateAnnouncementCompletion(1, 'testuser', true);
    await AnnouncementModel.updateAnnouncementCompletion(1, 'testuser2', true);
    const completions = await AnnouncementModel.getAnnouncementCompletions(1);
    expect(completions).toMatchObject({
      testuser: true,
      testuser2: true,
      testuser3: false,
    });
  });

  test('update announcement completions with invalid username', async () => {
    expect( () =>  AnnouncementModel.updateAnnouncementCompletion(1, 'invalid', true)).toThrow(
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
  });
});
