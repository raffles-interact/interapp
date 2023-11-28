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
}
