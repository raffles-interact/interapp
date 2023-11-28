import appDataSource from '@utils/init_datasource';
import { User, UserPermission, Announcement, AnnouncementCompletion } from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { UserModel } from './user';

export class AnnouncementModel {
  public static async createAnnouncement(announcement: Omit<Announcement, 'announcement_id'>) {
    const newAnnouncement = new Announcement();
    newAnnouncement.creation_date = announcement.creation_date;
    newAnnouncement.description = announcement.description;
    newAnnouncement.attachment = announcement.attachment;
    newAnnouncement.username = announcement.username;
    newAnnouncement.title = announcement.title;

    const user = await UserModel.getUser(announcement.username);
    newAnnouncement.user = user;
    newAnnouncement.username = user.username;
    try {
      await appDataSource.manager.insert(Announcement, newAnnouncement);
    } catch (e) {
      throw new HTTPError(
        'Announcement already exists',
        `Announcement with title ${announcement.title} already exists`,
        HTTPErrorCode.CONFLICT_ERROR,
      );
    }

    return newAnnouncement.announcement_id;
  }
  public static async getAnnouncement(announcement_id: number) {
    const announcement = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .where('announcement.announcement_id = :announcement_id', { announcement_id })
      .getOne();
    if (!announcement) {
      throw new HTTPError(
        'Announcement not found',
        `Announcement with id ${announcement_id} not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return announcement;
  }
  public static async getAnnouncements() {
    const announcements = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .getMany();
    return announcements;
  }
  public static async updateAnnouncement(new_announcement: Announcement) {
    try {
      await appDataSource.manager.update(
        Announcement,
        { announcement_id: new_announcement.announcement_id },
        new_announcement,
      );
    } catch (e) {
      throw new HTTPError('DB error', String(e), HTTPErrorCode.BAD_REQUEST_ERROR);
    }
    return await this.getAnnouncement(new_announcement.announcement_id);
  }
  public static async deleteAnnouncement(announcement_id: number) {
    await appDataSource.manager.delete(Announcement, { announcement_id });
  }
  public static async getAnnouncementCompletions(announcement_id: number) {
    const completions = await appDataSource.manager
      .createQueryBuilder()
      .select(['announcement_completion.username', 'announcement_completion.completed'])
      .from(AnnouncementCompletion, 'announcement_completion')
      .where('announcement_completion.announcement_id = :announcement_id', { announcement_id })
      .getMany();
    return Object.fromEntries(completions.map((completion) => [completion.username, completion.completed]));
  }
  public static async addAnnouncementCompletions(announcement_id: number, usernames: string[]) {
    const announcement = await this.getAnnouncement(announcement_id);
    const completions = await Promise.all(usernames.map(async (username) => {
      const completion = new AnnouncementCompletion();
      completion.announcement = announcement;
      completion.announcement_id = announcement_id;
      completion.username = username;
      completion.user = await UserModel.getUser(username);
      completion.completed = false;
      return completion;
    }));

    await appDataSource.manager.insert(AnnouncementCompletion, completions);
  }
  public static async updateAnnouncementCompletion(announcement_id: number, username: string, completed: boolean) {
    await appDataSource.manager.update(
      AnnouncementCompletion,
      { announcement_id, username },
      { completed },
    );
  }
}
